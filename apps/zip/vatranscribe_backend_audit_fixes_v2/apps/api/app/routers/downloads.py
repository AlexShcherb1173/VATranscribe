from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from apps.api.app.celery_client import celery_client
from apps.api.app.database import get_db
from apps.api.app.dependencies import get_current_user
from apps.api.app.models import Job, JobLog, JobStatus, JobType, SourceType, User
from apps.api.app.schemas import (
    DownloadAnalyzeRequest,
    DownloadAnalyzeResponse,
    DownloadJobCreateRequest,
    JobResponse,
)
from apps.api.app.services.quota_service import assert_can_create_job, increment_jobs_used
from packages.core.vatranscribe_core.download_engine import analyze_url

router = APIRouter(prefix="/downloads")


@router.post(
    "/analyze",
    response_model=DownloadAnalyzeResponse,
    summary="Analyze URL formats",
)
def analyze_download_url(
    payload: DownloadAnalyzeRequest,
    current_user: User = Depends(get_current_user),
) -> DownloadAnalyzeResponse:
    try:
        result = analyze_url(payload.url)
        return DownloadAnalyzeResponse(**result)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to analyze URL: {exc}",
        ) from exc


@router.post(
    "/jobs",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create and enqueue download job",
)
def create_download_job(
    payload: DownloadJobCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JobResponse:
    assert_can_create_job(db, current_user, jobs_to_add=1)

    requested_format = payload.requested_format.lower().strip()
    mp4_mode = (payload.mp4_mode or "compatible").lower().strip()

    if requested_format not in {"mp3", "mp4"}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="requested_format must be 'mp3' or 'mp4'",
        )

    if mp4_mode not in {"fast", "compatible"}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="mp4_mode must be 'fast' or 'compatible'",
        )

    job = Job(
        user_id=current_user.id,
        type=JobType.DOWNLOAD.value,
        status=JobStatus.QUEUED.value,
        source_type=SourceType.URL.value,
        title=f"Download {payload.requested_file_name}",
        input_url=payload.url.strip(),
        requested_format=requested_format,
        requested_file_name=payload.requested_file_name,
        mp4_mode=mp4_mode,
        selected_video_format_id=payload.selected_video_format_id,
        selected_audio_format_id=payload.selected_audio_format_id,
        download_audio=requested_format == "mp3",
        download_video=requested_format == "mp4",
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    increment_jobs_used(db, current_user, 1)

    db.add(JobLog(job_id=job.id, level="INFO", message="Download job created"))
    db.add(JobLog(job_id=job.id, level="INFO", message="Download job enqueued"))
    db.commit()

    celery_client.send_task("vatranscribe.jobs.execute", args=[job.id])

    return job