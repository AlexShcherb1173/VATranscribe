from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from apps.api.app.celery_client import celery_client
from apps.api.app.db import get_db
from apps.api.app.models import Job, JobLog, JobStatus, JobType, MediaAsset, SourceType, Transcript
from apps.api.app.schemas import JobResponse, TranscriptResponse, TranscriptionJobCreateRequest

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
) -> JobResponse:
    media_asset = db.get(MediaAsset, payload.media_asset_id)
    if media_asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media asset '{payload.media_asset_id}' not found",
        )

    job = Job(
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
def get_transcript(transcript_id: str, db: Session = Depends(get_db)) -> TranscriptResponse:
    transcript = db.get(Transcript, transcript_id)
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