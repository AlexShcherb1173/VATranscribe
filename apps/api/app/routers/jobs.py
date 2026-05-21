from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from apps.api.app.celery_client import celery_client
from apps.api.app.database import get_db
from apps.api.app.dependencies import get_current_user
from apps.api.app.models import Job, JobLog, JobStatus, MediaAsset, User
from apps.api.app.schemas import (
    JobActionResponse,
    JobCreateRequest,
    JobLogResponse,
    JobResponse,
)
from apps.api.app.services.quota_service import assert_can_create_job, increment_jobs_used

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def _get_job_or_404(job_id: str, db: Session, current_user: User) -> Job:
    stmt = select(Job).where(
        Job.id == job_id,
        Job.user_id == current_user.id,
    )
    job = db.scalar(stmt)

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job '{job_id}' not found",
        )

    return job


def _add_log(db: Session, job_id: str, level: str, message: str) -> None:
    db.add(JobLog(job_id=job_id, level=level, message=message))
    db.commit()


def _remove_media_file_safely(media_asset: MediaAsset | None) -> None:
    if media_asset is None or not media_asset.path:
        return

    path = Path(media_asset.path)

    try:
        if path.exists() and path.is_file():
            path.unlink(missing_ok=True)
    except OSError:
        pass


def _enqueue_existing_job(db: Session, job: Job, message: str) -> JobActionResponse:
    job.status = JobStatus.QUEUED.value
    job.error_message = None
    job.started_at = None
    job.finished_at = None

    db.add(job)
    db.commit()
    db.refresh(job)

    _add_log(db, job.id, "INFO", message)

    celery_client.send_task("vatranscribe.jobs.execute", args=[job.id])

    return JobActionResponse(
        ok=True,
        job_id=job.id,
        status=job.status,
        detail=message,
    )


@router.get("", response_model=list[JobResponse], summary="List jobs")
def list_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[JobResponse]:
    stmt = (
        select(Job)
        .where(Job.user_id == current_user.id)
        .order_by(Job.created_at.desc())
    )

    jobs = db.scalars(stmt).all()
    return list(jobs)


@router.get("/{job_id}", response_model=JobResponse, summary="Get job by id")
def get_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Job:
    return _get_job_or_404(job_id, db, current_user)


@router.post(
    "",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create generic job",
)
def create_job(
    payload: JobCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Job:
    assert_can_create_job(db, current_user, jobs_to_add=1)

    job = Job(
        user_id=current_user.id,
        type=payload.type,
        status=JobStatus.PENDING.value,
        source_type=payload.source_type,
        title=payload.title,
        input_url=payload.input_url,
        requested_format=payload.requested_format,
        requested_file_name=payload.requested_file_name,
        mp4_mode=payload.mp4_mode,
        selected_video_format_id=payload.selected_video_format_id,
        selected_audio_format_id=payload.selected_audio_format_id,
        transcription_media_asset_id=payload.transcription_media_asset_id,
        download_audio=payload.download_audio,
        download_video=payload.download_video,
        transcription_model=payload.transcription_model,
        transcription_language=payload.transcription_language,
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    increment_jobs_used(db, current_user, 1)

    db.add(JobLog(job_id=job.id, level="INFO", message="Job created"))
    db.commit()

    return job


@router.get(
    "/{job_id}/logs",
    response_model=list[JobLogResponse],
    summary="Get job logs",
)
def get_job_logs(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[JobLog]:
    _get_job_or_404(job_id, db, current_user)

    stmt = (
        select(JobLog)
        .where(JobLog.job_id == job_id)
        .order_by(JobLog.created_at.asc())
    )

    logs = db.scalars(stmt).all()
    return list(logs)


@router.post(
    "/{job_id}/enqueue",
    response_model=JobActionResponse,
    summary="Enqueue job",
)
def enqueue_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JobActionResponse:
    job = _get_job_or_404(job_id, db, current_user)

    if job.status == JobStatus.RUNNING.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Job is already running",
        )

    if job.status == JobStatus.CANCELED.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Canceled job cannot be enqueued",
        )

    return _enqueue_existing_job(db, job, "Job enqueued")


@router.post(
    "/{job_id}/retry",
    response_model=JobActionResponse,
    summary="Retry job",
)
def retry_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JobActionResponse:
    job = _get_job_or_404(job_id, db, current_user)

    if job.status not in {
        JobStatus.FAILED.value,
        JobStatus.CANCELED.value,
        JobStatus.SUCCEEDED.value,
    }:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only failed, canceled, or succeeded jobs can be retried",
        )

    return _enqueue_existing_job(db, job, "Job retried and enqueued")


@router.post(
    "/{job_id}/restart",
    response_model=JobActionResponse,
    summary="Restart job",
)
def restart_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JobActionResponse:
    """
    Frontend-compatible alias for retry.
    """
    return retry_job(job_id=job_id, db=db, current_user=current_user)


@router.post(
    "/{job_id}/cancel",
    response_model=JobActionResponse,
    summary="Cancel job",
)
def cancel_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JobActionResponse:
    job = _get_job_or_404(job_id, db, current_user)

    if job.status in {
        JobStatus.SUCCEEDED.value,
        JobStatus.FAILED.value,
        JobStatus.CANCELED.value,
    }:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Completed or canceled job cannot be canceled",
        )

    job.status = JobStatus.CANCELED.value

    db.add(job)
    db.commit()
    db.refresh(job)

    _add_log(db, job.id, "WARNING", "Job canceled")

    return JobActionResponse(
        ok=True,
        job_id=job.id,
        status=job.status,
        detail="Job canceled",
    )


@router.delete(
    "/{job_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete job",
)
def delete_job(
    job_id: str,
    delete_media: bool = Query(
        default=False,
        description="Also delete output media file created by this job.",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str | bool]:
    job = _get_job_or_404(job_id, db, current_user)

    if job.status == JobStatus.RUNNING.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Running job cannot be deleted. Cancel it first.",
        )

    media_asset_to_delete = job.output_media_asset if delete_media else None
    deleted_media_asset_id = media_asset_to_delete.id if media_asset_to_delete else None

    db.delete(job)
    db.commit()

    if media_asset_to_delete is not None:
        _remove_media_file_safely(media_asset_to_delete)
        db.delete(media_asset_to_delete)
        db.commit()

    return {
        "ok": True,
        "job_id": job_id,
        "deleted_media": bool(deleted_media_asset_id),
        "deleted_media_asset_id": deleted_media_asset_id or "",
    }


@router.post(
    "/{job_id}/stop",
    response_model=JobActionResponse,
    summary="Stop job",
)
def stop_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JobActionResponse:
    """
    Frontend-compatible alias for cancel.
    """
    return cancel_job(job_id=job_id, db=db, current_user=current_user)