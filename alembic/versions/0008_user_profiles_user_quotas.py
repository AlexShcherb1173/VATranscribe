"""add user profile and quota tables

Revision ID: 682324900ca4
Revises: <PREV_REVISION>
Create Date: 2026-04-21
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("avatar_url", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("user_id", name="user_profiles_user_id_key"),
    )
    op.create_index(op.f("ix_user_profiles_user_id"), "user_profiles", ["user_id"], unique=False)

    op.create_table(
        "user_quotas",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("storage_bytes_used", sa.BigInteger(), nullable=False, server_default="0"),
        sa.Column("transcription_seconds_used", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("jobs_count_used", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("storage_bytes_limit", sa.BigInteger(), nullable=False, server_default=str(10 * 1024 * 1024 * 1024)),
        sa.Column("transcription_seconds_limit", sa.Integer(), nullable=False, server_default="36000"),
        sa.Column("jobs_count_limit", sa.Integer(), nullable=False, server_default="500"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("user_id", name="user_quotas_user_id_key"),
    )
    op.create_index(op.f("ix_user_quotas_user_id"), "user_quotas", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_user_quotas_user_id"), table_name="user_quotas")
    op.drop_table("user_quotas")

    op.drop_index(op.f("ix_user_profiles_user_id"), table_name="user_profiles")
    op.drop_table("user_profiles")