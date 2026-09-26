"""user password reset otp

Revision ID: b7c41f0e2d19
Revises: a1e72c6d7e63
Create Date: 2026-09-26 11:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b7c41f0e2d19'
down_revision: Union[str, None] = 'a1e72c6d7e63'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("reset_otp_hash", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("reset_otp_expires_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("users") as batch:
        batch.drop_column("reset_otp_expires_at")
        batch.drop_column("reset_otp_hash")
