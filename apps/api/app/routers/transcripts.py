from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from apps.api.app.db import get_db
from apps.api.app.dependencies import get_current_user
from apps.api.app.models import MediaAsset, Transcript, User
from apps.api.app.schemas import (
    ExportArtifactResponse,
    TranscriptResponse,
    TranscriptSegmentResponse,
)

router = APIRouter(prefix="/transcripts")


def _build_transcript_response(item: Transcript) -> TranscriptResponse:
    return TranscriptResponse(
        id=item.id,
        job_id=item.job_id,
        media_asset_id=item.media_asset_id,
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
        ],
        exports=[
            ExportArtifactResponse(
                id=artifact.id,
                transcript_id=artifact.transcript_id,
                format=artifact.format,
                path=artifact.path,
                size_bytes=artifact.size_bytes,
                created_at=artifact.created_at,
                download_url=f"/api/v1/export-artifacts/{artifact.id}/download",
            )
            for artifact in item.export_artifacts
        ],
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


@router.get(
    "",
    response_model=list[TranscriptResponse],
    summary="List transcripts",
)
def list_transcripts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TranscriptResponse]:
    stmt = (
        select(Transcript)
        .join(MediaAsset, Transcript.media_asset_id == MediaAsset.id)
        .where(MediaAsset.user_id == current_user.id)
        .order_by(Transcript.created_at.desc())
    )
    items = db.scalars(stmt).all()

    return [
        TranscriptResponse(
            id=item.id,
            job_id=item.job_id,
            media_asset_id=item.media_asset_id,
            language=item.language,
            model_name=item.model_name,
            engine=item.engine,
            full_text=item.full_text,
            created_at=item.created_at,
            segments=[],
            exports=[],
        )
        for item in items
    ]


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
    item = _get_transcript_or_404(transcript_id, db, current_user)
    return _build_transcript_response(item)