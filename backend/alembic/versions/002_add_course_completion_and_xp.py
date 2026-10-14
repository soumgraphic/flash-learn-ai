"""002 Add course completion tracking and XP rewards to courses table.

Revision ID: 002_add_course_completion_and_xp
Revises: 001_initial_schema
Create Date: 2026-10-14 12:00:00.000000

Educational Note for Students:
------------------------------
Expand & Contract Zero-Downtime Migration Pattern:
1. When adding columns to a table that already has live data (e.g. `courses`), you must:
   - Provide a sensible default (e.g. `server_default='false'` for boolean, `50` for XP)
     so existing rows get populated automatically.
   - Or set `nullable=True` (e.g. `completed_at` is only populated when a course is actually finished).
2. Never drop columns or rename columns directly without a multi-phase migration, otherwise
   older running container instances will fail when querying the missing field.
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "002_course_completion_xp"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Safely add completion tracking and gamification columns to existing courses table
    op.add_column(
        "courses",
        sa.Column("is_completed", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )
    op.add_column(
        "courses",
        sa.Column("xp_earned", sa.Integer(), server_default=sa.text("50"), nullable=False),
    )
    op.add_column(
        "courses",
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    # Reversible migration: drop added columns if rolling back
    op.drop_column("courses", "completed_at")
    op.drop_column("courses", "xp_earned")
    op.drop_column("courses", "is_completed")
