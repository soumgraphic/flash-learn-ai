"""003 Add quiz score column to courses table.

Revision ID: 003_add_course_quiz_score
Revises: 002_course_completion_xp
Create Date: 2026-10-14 16:35:00.000000

Educational Note for Students:
------------------------------
Expand & Contract Zero-Downtime Migration Pattern:
When adding an optional measurement/metric column (such as quiz_score),
setting `nullable=True` ensures existing courses immediately remain valid
without requiring arbitrary placeholder values.
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "003_add_course_quiz_score"
down_revision: Union[str, None] = "002_course_completion_xp"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add quiz_score column to courses table
    op.add_column(
        "courses",
        sa.Column("quiz_score", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    # Reversible migration: drop quiz_score column if rolling back
    op.drop_column("courses", "quiz_score")
