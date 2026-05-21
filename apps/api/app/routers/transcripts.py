from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from apps.api.app.database import get_db
from apps.api.app.dependencies import get_current_user
from apps.api.app.models import ExportArtifact, MediaAsset, Transcript, User
from apps.api.app.schemas import (
    ExportArtifactResponse,
    MediaAssetResponse,
    TranscriptResponse,
    TranscriptSegmentResponse,
)
from apps.api.app.services.quota_service import sync_storage_usage_from_media_assets
from packages.core.vatranscribe_core.storage import resolve_storage_path

router = APIRouter(prefix="/transcripts", tags=["Transcripts"])


def _build_media_asset_response(item: MediaAsset | None) -> MediaAssetResponse | None:
    if item is None:
        return None

    return MediaAssetResponse(
        id=item.id,
        kind=item.kind,
        original_name=item.original_name,
        stored_name=item.stored_name,
        mime_type=item.mime_type,
        extension=item.extension,
        size_bytes=item.size_bytes,
        duration_sec=item.duration_sec,
        path=item.path,
        checksum_sha256=item.checksum_sha256,
        created_at=item.created_at,
        download_url=f"/api/v1/media-assets/{item.id}/download",
    )


def _source_file_name(item: Transcript) -> str | None:
    if item.media_asset is None:
        return None

    return (
        item.media_asset.original_name
        or item.media_asset.stored_name
        or Path(item.media_asset.path).name
        or None
    )


def _display_name(item: Transcript) -> str:
    return (
        _source_file_name(item)
        or getattr(item.job, "title", None)
        or item.id
    )


def _build_export_response(item: ExportArtifact) -> ExportArtifactResponse:
    return ExportArtifactResponse(
        id=item.id,
        transcript_id=item.transcript_id,
        format=item.format,
        path=item.path,
        size_bytes=item.size_bytes,
        created_at=item.created_at,
        download_url=f"/api/v1/transcripts/export-artifacts/{item.id}/download",
    )


def _build_transcript_response(
    item: Transcript,
    *,
    include_segments: bool = True,
    include_exports: bool = True,
) -> TranscriptResponse:
    return TranscriptResponse(
        id=item.id,
        job_id=item.job_id,
        media_asset_id=item.media_asset_id,
        media_asset=_build_media_asset_response(item.media_asset),
        source_file_name=_source_file_name(item),
        display_name=_display_name(item),
        language=item.language,
        model_name=item.model_name,
        engine=item.engine,
        full_text=item.full_text,
        created_at=item.created_at,
        segments=[
            TranscriptSegmentResponse(
                id=segment.id,
                transcript_id=segment.transcript_id,
                start_sec=segment.start_sec,
                end_sec=segment.end_sec,
                text=segment.text,
                speaker_label=segment.speaker_label,
                confidence=segment.confidence,
                order_index=segment.order_index,
            )
            for segment in item.segments
        ] if include_segments else [],
        exports=[
            _build_export_response(artifact)
            for artifact in item.export_artifacts
        ] if include_exports else [],
    )


def _get_transcript_or_404(
    transcript_id: str,
    db: Session,
    current_user: User,
) -> Transcript:
    stmt = (
        select(Transcript)
        .join(MediaAsset, Transcript.media_asset_id == MediaAsset.id)
        .options(
            selectinload(Transcript.media_asset),
            selectinload(Transcript.job),
            selectinload(Transcript.segments),
            selectinload(Transcript.export_artifacts),
        )
        .where(
            Transcript.id == transcript_id,
            MediaAsset.user_id == current_user.id,
        )
    )
    item = db.scalar(stmt)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transcript '{transcript_id}' not found",
        )
    return item


def _get_export_artifact_or_404(
    artifact_id: str,
    db: Session,
    current_user: User,
) -> ExportArtifact:
    stmt = (
        select(ExportArtifact)
        .join(Transcript, ExportArtifact.transcript_id == Transcript.id)
        .join(MediaAsset, Transcript.media_asset_id == MediaAsset.id)
        .options(selectinload(ExportArtifact.transcript).selectinload(Transcript.media_asset))
        .where(
            ExportArtifact.id == artifact_id,
            MediaAsset.user_id == current_user.id,
        )
    )
    item = db.scalar(stmt)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Export artifact '{artifact_id}' not found",
        )

    return item


@router.get("", response_model=list[TranscriptResponse], summary="List transcripts")
def list_transcripts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TranscriptResponse]:
    stmt = (
        select(Transcript)
        .join(MediaAsset, Transcript.media_asset_id == MediaAsset.id)
        .options(
            selectinload(Transcript.media_asset),
            selectinload(Transcript.job),
            selectinload(Transcript.export_artifacts),
        )
        .where(MediaAsset.user_id == current_user.id)
        .order_by(Transcript.created_at.desc())
    )
    items = db.scalars(stmt).all()

    return [
        _build_transcript_response(item, include_segments=False, include_exports=True)
        for item in items
    ]


@router.get("/export-artifacts/{artifact_id}/download", summary="Download transcript export artifact")
def download_export_artifact(
    artifact_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = _get_export_artifact_or_404(artifact_id, db, current_user)
    file_path = resolve_storage_path(item.path)

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Export artifact file for '{artifact_id}' not found on disk",
        )

    media_type = {
        "txt": "text/plain; charset=utf-8",
        "srt": "application/x-subrip",
        "vtt": "text/vtt",
        "json": "application/json",
    }.get((item.format or "").lower(), "application/octet-stream")

    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=file_path.name,
    )


@router.delete(
    "/export-artifacts/{artifact_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete transcript export artifact",
)
def delete_export_artifact(
    artifact_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    item = _get_export_artifact_or_404(artifact_id, db, current_user)
    file_path = resolve_storage_path(item.path)

    if file_path.exists() and file_path.is_file():
        file_path.unlink(missing_ok=True)

    db.delete(item)
    db.commit()

    sync_storage_usage_from_media_assets(db, current_user)

    return {"status": "ok", "message": f"Export artifact '{artifact_id}' deleted"}


@router.get("/{transcript_id}", response_model=TranscriptResponse, summary="Get transcript by id")
def get_transcript(
    transcript_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TranscriptResponse:
    item = _get_transcript_or_404(transcript_id, db, current_user)
    return _build_transcript_response(item)


@router.delete(
    "/{transcript_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete transcript and its export files",
)
def delete_transcript(
    transcript_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    item = _get_transcript_or_404(transcript_id, db, current_user)

    for artifact in item.export_artifacts:
        artifact_path = resolve_storage_path(artifact.path)
        if artifact_path.exists() and artifact_path.is_file():
            artifact_path.unlink(missing_ok=True)

    db.delete(item)
    db.commit()

    sync_storage_usage_from_media_assets(db, current_user)

    return {"status": "ok", "message": f"Transcript '{transcript_id}' deleted"}
