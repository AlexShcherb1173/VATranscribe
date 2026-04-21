from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from apps.api.app.models import Plan, Subscription, UsageSnapshot, User
from apps.api.app.services.account_bootstrap import ensure_user_quota


def seed_default_plans(db: Session) -> None:
    existing = db.scalars(select(Plan)).all()
    if existing:
        return

    plans = [
        Plan(
            id=str(uuid.uuid4()),
            code="starter",
            name="Starter",
            price_monthly=0,
            currency="USD",
            storage_bytes_limit=10 * 1024 * 1024 * 1024,
            transcription_seconds_limit=10 * 60 * 60,
            jobs_count_limit=500,
            is_active=True,
        ),
        Plan(
            id=str(uuid.uuid4()),
            code="pro",
            name="Pro",
            price_monthly=19,
            currency="USD",
            storage_bytes_limit=100 * 1024 * 1024 * 1024,
            transcription_seconds_limit=100 * 60 * 60,
            jobs_count_limit=5000,
            is_active=True,
        ),
        Plan(
            id=str(uuid.uuid4()),
            code="team",
            name="Team",
            price_monthly=79,
            currency="USD",
            storage_bytes_limit=500 * 1024 * 1024 * 1024,
            transcription_seconds_limit=500 * 60 * 60,
            jobs_count_limit=25000,
            is_active=True,
        ),
    ]
    db.add_all(plans)
    db.commit()


def ensure_user_subscription(db: Session, user: User) -> Subscription:
    sub = db.scalar(
        select(Subscription)
        .where(Subscription.user_id == user.id)
        .order_by(Subscription.created_at.desc())
    )
    if sub is not None:
        return sub

    seed_default_plans(db)
    starter = db.scalar(select(Plan).where(Plan.code == "starter"))
    assert starter is not None

    now = datetime.now(timezone.utc)
    sub = Subscription(
        id=str(uuid.uuid4()),
        user_id=user.id,
        plan_id=starter.id,
        status="active",
        started_at=now,
        current_period_start=now,
        current_period_end=now + timedelta(days=30),
        cancel_at_period_end=False,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    quota = ensure_user_quota(db, user)
    quota.storage_bytes_limit = starter.storage_bytes_limit
    quota.transcription_seconds_limit = starter.transcription_seconds_limit
    quota.jobs_count_limit = starter.jobs_count_limit
    db.add(quota)
    db.commit()

    return sub


def ensure_usage_snapshots(db: Session, user: User) -> list[UsageSnapshot]:
    existing = db.scalars(
        select(UsageSnapshot)
        .where(UsageSnapshot.user_id == user.id)
        .order_by(UsageSnapshot.created_at.asc())
    ).all()
    if existing:
        return list(existing)

    quota = ensure_user_quota(db, user)

    snapshots = [
        UsageSnapshot(
            id=str(uuid.uuid4()),
            user_id=user.id,
            label="Current",
            storage_bytes_used=quota.storage_bytes_used,
            transcription_seconds_used=quota.transcription_seconds_used,
            jobs_count_used=quota.jobs_count_used,
        )
    ]
    db.add_all(snapshots)
    db.commit()
    return snapshots


def get_billing_overview(db: Session, user: User) -> dict:
    seed_default_plans(db)

    subscription = ensure_user_subscription(db, user)
    usage_history = ensure_usage_snapshots(db, user)

    available_plans = db.scalars(
        select(Plan)
        .where(Plan.is_active.is_(True))
        .order_by(Plan.price_monthly.asc())
    ).all()

    current_plan = db.get(Plan, subscription.plan_id)
    assert current_plan is not None

    return {
        "current_plan": current_plan,
        "available_plans": list(available_plans),
        "subscription": subscription,
        "usage_history": list(usage_history),
    }