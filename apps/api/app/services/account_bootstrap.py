import uuid

from sqlalchemy.orm import Session

from apps.api.app.models import User, UserProfile, UserQuota


def ensure_user_profile(db: Session, user: User) -> UserProfile:
    if user.profile is not None:
        return user.profile

    profile = UserProfile(
        id=str(uuid.uuid4()),
        user_id=user.id,
        full_name=None,
        company_name=None,
        timezone="UTC",
        locale="en",
        avatar_url=None,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def ensure_user_quota(db: Session, user: User) -> UserQuota:
    if user.quota is not None:
        return user.quota

    quota = UserQuota(
        id=str(uuid.uuid4()),
        user_id=user.id,
        storage_bytes_used=0,
        transcription_seconds_used=0,
        jobs_count_used=0,
        storage_bytes_limit=10 * 1024 * 1024 * 1024,
        transcription_seconds_limit=10 * 60 * 60,
        jobs_count_limit=500,
    )
    db.add(quota)
    db.commit()
    db.refresh(quota)
    return quota