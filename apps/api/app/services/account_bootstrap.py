from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from apps.api.app.models import User, UserQuota


DEFAULT_STORAGE_LIMIT = 10 * 1024 * 1024 * 1024
DEFAULT_TRANSCRIPTION_LIMIT = 10 * 60 * 60
DEFAULT_JOBS_LIMIT = 500


def ensure_user_quota(db: Session, user: User) -> UserQuota:
    """
    Idempotent quota bootstrap.

    Guarantees exactly one quota row per user.
    Safe for repeated calls.
    Safe against concurrent requests.
    """

    existing = db.scalar(
        select(UserQuota).where(UserQuota.user_id == user.id)
    )
    if existing is not None:
        return existing

    quota = UserQuota(
        id=str(uuid.uuid4()),
        user_id=user.id,
        storage_bytes_used=0,
        transcription_seconds_used=0,
        jobs_count_used=0,
        storage_bytes_limit=DEFAULT_STORAGE_LIMIT,
        transcription_seconds_limit=DEFAULT_TRANSCRIPTION_LIMIT,
        jobs_count_limit=DEFAULT_JOBS_LIMIT,
    )

    db.add(quota)

    try:
        db.commit()
        db.refresh(quota)
        return quota

    except IntegrityError:
        # another request inserted row first
        db.rollback()

        existing = db.scalar(
            select(UserQuota).where(UserQuota.user_id == user.id)
        )
        if existing is not None:
            return existing

        raise