from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from apps.api.app.celery_client import celery_client
from apps.api.app.db import get_db
from apps.api.app.dependencies import get_current_user
from apps.api.app.models import (
    Job,
    JobLog,
    JobStatus,
    JobType,
    MediaAsset,
    SourceType,
    Transcript,
    User,
)
from apps.api.app.schemas import JobResponse, TranscriptResponse, TranscriptionJobCreateRequest
from apps.api.app.services.quota_service import (
    assert_can_create_job,
    assert_can_use_transcription_seconds,
    estimate_media_duration_seconds,
)

router = APIRouter(prefix="/transcriptions")


@router.post(
    "/jobs",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create and enqueue transcription job",
)
def create_transcription_job(
    payload: TranscriptionJobCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JobResponse:
    stmt = select(MediaAsset).where(
        MediaAsset.id == payload.media_asset_id,
        MediaAsset.user_id == current_user.id,
    )
    media_asset = db.scalar(stmt)

    if media_asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media asset '{payload.media_asset_id}' not found",
        )

    assert_can_create_job(db, current_user, jobs_to_add=1)
    assert_can_use_transcription_seconds(
        db,
        current_user,
        seconds_to_add=estimate_media_duration_seconds(media_asset),
    )

    job = Job(
        user_id=current_user.id,
        type=JobType.TRANSCRIBE.value,
        status=JobStatus.QUEUED.value,
        source_type=SourceType.LOCAL_FILE.value,
        title=f"Transcribe {media_asset.stored_name}",
        transcription_media_asset_id=media_asset.id,
        transcription_model=payload.model_name,
        transcription_language=payload.language,
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    db.add(JobLog(job_id=job.id, level="INFO", message="Transcription job created"))
    db.add(JobLog(job_id=job.id, level="INFO", message="Transcription job enqueued"))
    db.commit()

    celery_client.send_task("vatranscribe.jobs.execute", args=[job.id])

    return job


@router.get(
    "/{transcript_id}",
    response_model=TranscriptResponse,
    summary="Get transcript by id",
)
def get_transcript(
    transcript_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TranscriptResponse:
    stmt = (
        select(Transcript)
        .join(MediaAsset, Transcript.media_asset_id == MediaAsset.id)
        .where(
            Transcript.id == transcript_id,
            MediaAsset.user_id == current_user.id,
        )
    )
    transcript = db.scalar(stmt)

    if transcript is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transcript '{transcript_id}' not found",
        )

    return TranscriptResponse(
        id=transcript.id,
        job_id=transcript.job_id,
        media_asset_id=transcript.media_asset_id,
        language=transcript.language,
        model_name=transcript.model_name,
        engine=transcript.engine,
        full_text=transcript.full_text,
        created_at=transcript.created_at,
        segments=list(transcript.segments),
        exports=list(transcript.export_artifacts),
    )