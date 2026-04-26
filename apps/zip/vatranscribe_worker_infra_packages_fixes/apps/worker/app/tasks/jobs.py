from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from apps.api.app.config import get_settings
from apps.api.app.database import SessionLocal
from apps.api.app.models import (
    ExportArtifact,
    Job,
    JobLog,
    JobStatus,
    MediaAsset,
    Transcript,
    TranscriptSegment,
    User,
)
from apps.api.app.services.quota_service import (
    assert_can_store_bytes,
    increment_storage_used,
    increment_transcription_seconds_used,
)
from apps.worker.app.worker import celery
from packages.core.vatranscribe_core.audio_tools import extract_audio_for_transcription
from packages.core.vatranscribe_core.download_engine import download_media
from packages.core.vatranscribe_core.export_tools import write_json, write_srt, write_txt, write_vtt
from packages.core.vatranscribe_core.ffmpeg_tools import merge_video_and_audio_to_compatible_mp4
from packages.core.vatranscribe_core.media_probe import extract_basic_media_metadata
from packages.core.vatranscribe_core.storage import build_download_target_path
from packages.core.vatranscribe_core.transcription_engine import transcribe_media
from packages.core.vatranscribe_core.utils import sha256_of_file


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def add_job_log(db: Session, job_id: str, level: str, message: str) -> None:
    db.add(JobLog(job_id=job_id, level=level, message=message))
    db.commit()


def _guess_media_kind(requested_format: str) -> str:
    return "audio" if requested_format == "mp3" else "video"


def _guess_mime_type(requested_format: str) -> str:
    return "audio/mpeg" if requested_format == "mp3" else "video/mp4"


def _remove_file_safely(path: Path) -> None:
    try:
        if path.exists() and path.is_file():
            path.unlink(missing_ok=True)
    except OSError:
        pass


def _duration_from_segments(segments: list[dict[str, Any]]) -> int:
    if not segments:
        return 0
    last_end = max(int(segment.get("end_sec") or 0) for segment in segments)
    return max(last_end, 0)


def _run_download_job(db: Session, job: Job) -> dict[str, Any]:
    if not job.input_url:
        raise ValueError("Download job requires input_url")
    if not job.requested_format:
        raise ValueError("Download job requires requested_format")
    if not job.requested_file_name:
        raise ValueError("Download job requires requested_file_name")

    requested_format = job.requested_format.lower().strip()
    mp4_mode = (job.mp4_mode or "compatible").lower().strip()

    add_job_log(db, job.id, "INFO", f"Preparing download for URL: {job.input_url}")
    add_job_log(db, job.id, "INFO", f"Requested format: {requested_format}")
    if requested_format == "mp4":
        add_job_log(db, job.id, "INFO", f"MP4 mode: {mp4_mode}")
    add_job_log(db, job.id, "INFO", f"Requested file name: {job.requested_file_name}")

    target_path = build_download_target_path(
        requested_format=requested_format,
        requested_file_name=job.requested_file_name,
    )
    add_job_log(db, job.id, "INFO", f"Target path: {target_path}")

    result = download_media(
        url=job.input_url,
        requested_format=requested_format,
        output_path=target_path,
        mp4_mode=mp4_mode,
        video_format_id=job.selected_video_format_id,
        audio_format_id=job.selected_audio_format_id,
    )

    if requested_format == "mp4" and mp4_mode == "compatible":
        video_path = Path(result["video_path"])
        audio_path = Path(result["audio_path"])
        final_path = Path(result["final_path"])

        add_job_log(db, job.id, "INFO", f"Downloaded video stream: {video_path}")
        add_job_log(db, job.id, "INFO", f"Downloaded audio stream: {audio_path}")
        add_job_log(db, job.id, "INFO", "Running ffmpeg compatible merge: video copy + audio AAC")

        final_path = merge_video_and_audio_to_compatible_mp4(
            video_path=video_path,
            audio_path=audio_path,
            output_path=final_path,
        )
        _remove_file_safely(video_path)
        _remove_file_safely(audio_path)
        add_job_log(db, job.id, "INFO", f"Compatible MP4 created: {final_path}")
    else:
        final_path = Path(result["final_path"])
        add_job_log(db, job.id, "INFO", f"Download completed: {final_path}")

    metadata = extract_basic_media_metadata(final_path)
    size_bytes = int(metadata.get("size_bytes") or 0)

    user = db.get(User, job.user_id) if job.user_id else None
    if user is not None:
        try:
            assert_can_store_bytes(db, user, size_bytes)
        except Exception:
            _remove_file_safely(final_path)
            raise

    checksum = sha256_of_file(final_path)

    media_asset = MediaAsset(
        user_id=job.user_id,
        kind=_guess_media_kind(requested_format),
        original_name=final_path.name,
        stored_name=final_path.name,
        mime_type=_guess_mime_type(requested_format),
        extension=final_path.suffix.lstrip("."),
        size_bytes=size_bytes,
        duration_sec=metadata.get("duration_sec"),
        path=str(final_path).replace("\\", "/"),
        checksum_sha256=checksum,
    )
    db.add(media_asset)
    db.commit()
    db.refresh(media_asset)

    add_job_log(db, job.id, "INFO", f"Media asset created: {media_asset.id}")

    if metadata.get("video_codec"):
        add_job_log(db, job.id, "INFO", f"Video codec: {metadata['video_codec']}")
    if metadata.get("audio_codec"):
        add_job_log(db, job.id, "INFO", f"Audio codec: {metadata['audio_codec']}")

    job.output_media_asset_id = media_asset.id
    db.add(job)
    db.commit()

    return {
        "output_media_asset_id": media_asset.id,
        "path": str(final_path),
        "size_bytes": media_asset.size_bytes or 0,
    }


def _run_transcription_job(db: Session, job: Job) -> dict[str, Any]:
    settings = get_settings()

    if not job.transcription_media_asset_id:
        raise ValueError("Transcription job requires transcription_media_asset_id")

    media_asset = db.get(MediaAsset, job.transcription_media_asset_id)
    if media_asset is None:
        raise ValueError(f"Media asset '{job.transcription_media_asset_id}' not found")

    source_path = Path(media_asset.path)
    if not source_path.exists() or not source_path.is_file():
        raise FileNotFoundError(f"Source media file not found: {source_path}")

    add_job_log(db, job.id, "INFO", f"Source media asset: {media_asset.id}")
    add_job_log(db, job.id, "INFO", f"Source path: {source_path}")

    settings.temp_dir.mkdir(parents=True, exist_ok=True)
    audio_path = settings.temp_dir / f"{job.id}_transcription.wav"

    try:
        add_job_log(db, job.id, "INFO", f"Extracting audio for transcription to: {audio_path}")
        extract_audio_for_transcription(source_path, audio_path)

        model_name = job.transcription_model or settings.default_transcription_model
        language = job.transcription_language or settings.default_language

        add_job_log(db, job.id, "INFO", f"Transcription model: {model_name}")
        add_job_log(db, job.id, "INFO", f"Transcription language: {language or 'auto'}")

        result = transcribe_media(
            audio_path=audio_path,
            model_name=model_name,
            language=language,
        )
    finally:
        _remove_file_safely(audio_path)

    transcript = Transcript(
        job_id=job.id,
        media_asset_id=media_asset.id,
        language=result["language"],
        model_name=result["model_name"],
        engine=result["engine"],
        full_text=result["full_text"],
    )
    db.add(transcript)
    db.commit()
    db.refresh(transcript)

    add_job_log(db, job.id, "INFO", f"Transcript created: {transcript.id}")

    for segment in result["segments"]:
        db.add(
            TranscriptSegment(
                transcript_id=transcript.id,
                start_sec=int(segment["start_sec"]),
                end_sec=int(segment["end_sec"]),
                text=segment["text"],
                speaker_label=segment.get("speaker_label"),
                confidence=segment.get("confidence"),
                order_index=int(segment["order_index"]),
            )
        )
    db.commit()

    add_job_log(db, job.id, "INFO", f"Transcript segments saved: {len(result['segments'])}")

    settings.transcripts_txt_dir.mkdir(parents=True, exist_ok=True)
    settings.transcripts_srt_dir.mkdir(parents=True, exist_ok=True)
    settings.transcripts_vtt_dir.mkdir(parents=True, exist_ok=True)
    settings.transcripts_json_dir.mkdir(parents=True, exist_ok=True)

    txt_path = settings.transcripts_txt_dir / f"{transcript.id}.txt"
    srt_path = settings.transcripts_srt_dir / f"{transcript.id}.srt"
    vtt_path = settings.transcripts_vtt_dir / f"{transcript.id}.vtt"
    json_path = settings.transcripts_json_dir / f"{transcript.id}.json"

    write_txt(result["full_text"], txt_path)
    write_srt(result["segments"], srt_path)
    write_vtt(result["segments"], vtt_path)
    write_json(result, json_path)

    for export_format, export_path in [
        ("txt", txt_path),
        ("srt", srt_path),
        ("vtt", vtt_path),
        ("json", json_path),
    ]:
        db.add(
            ExportArtifact(
                transcript_id=transcript.id,
                format=export_format,
                path=str(export_path).replace("\\", "/"),
                size_bytes=export_path.stat().st_size,
            )
        )
    db.commit()

    add_job_log(db, job.id, "INFO", "Transcript export artifacts created")

    duration_sec_used = int(media_asset.duration_sec or 0)
    if duration_sec_used <= 0:
        duration_sec_used = _duration_from_segments(result["segments"])

    return {
        "transcript_id": transcript.id,
        "path": str(txt_path),
        "duration_sec_used": duration_sec_used,
    }


def _apply_quota_updates_after_success(db: Session, job: Job, result: dict[str, Any]) -> None:
    if not job.user_id:
        return

    user = db.get(User, job.user_id)
    if user is None:
        return

    if job.type == "download":
        size_bytes = int(result.get("size_bytes") or 0)
        if size_bytes > 0:
            increment_storage_used(db, user, size_bytes)

    if job.type == "transcribe":
        duration_sec_used = int(result.get("duration_sec_used") or 0)
        if duration_sec_used > 0:
            increment_transcription_seconds_used(db, user, duration_sec_used)


@celery.task(name="vatranscribe.jobs.execute")
def execute_job_task(job_id: str) -> dict[str, Any]:
    db = SessionLocal()
    try:
        job = db.get(Job, job_id)
        if job is None:
            return {"ok": False, "detail": f"Job '{job_id}' not found"}

        if job.status == JobStatus.CANCELED.value:
            add_job_log(db, job_id, "WARNING", "Execution skipped because job is canceled")
            return {"ok": False, "detail": "Job canceled"}

        job.status = JobStatus.RUNNING.value
        job.started_at = _utcnow()
        job.error_message = None
        db.add(job)
        db.commit()

        add_job_log(db, job.id, "INFO", f"Job execution started (type={job.type})")

        if job.type == "download":
            result = _run_download_job(db, job)
        elif job.type == "transcribe":
            result = _run_transcription_job(db, job)
        else:
            raise ValueError(f"Unsupported job type: {job.type}")

        _apply_quota_updates_after_success(db, job, result)

        job = db.get(Job, job_id)
        if job is not None:
            job.status = JobStatus.SUCCEEDED.value
            job.finished_at = _utcnow()
            db.add(job)
            db.commit()
            add_job_log(db, job.id, "INFO", "Job execution finished successfully")

        return {"ok": True, "job_id": job_id, "status": JobStatus.SUCCEEDED.value, **result}

    except Exception as exc:
        db.rollback()
        job = db.get(Job, job_id)
        if job is not None:
            job.status = JobStatus.FAILED.value
            job.error_message = str(exc)
            job.finished_at = _utcnow()
            db.add(job)
            db.commit()
            add_job_log(db, job.id, "ERROR", f"Job failed: {exc}")

        return {"ok": False, "job_id": job_id, "detail": str(exc)}

    finally:
        db.close()
