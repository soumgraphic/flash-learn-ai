"""Unit tests for Alembic database migrations.

Educational Notes for Students:
------------------------------
1. Why test migrations?
   A broken migration script in production can lock tables, cause deploy failures, or
   corrupt schemas. Testing migrations in CI ensures both `upgrade()` and `downgrade()`
   execute cleanly without syntax or foreign-key constraint errors.
"""

from alembic.config import Config

from alembic import command


def test_alembic_migrations_execute_cleanly(tmp_path):
    """Verifies that all migrations can be applied to head and downgraded successfully."""
    test_db = tmp_path / "test_migration.db"
    db_url = f"sqlite+aiosqlite:///{test_db}"

    # Point alembic config to temporary SQLite database
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", db_url)

    # 1. Upgrade to head
    command.upgrade(alembic_cfg, "head")

    # 2. Downgrade back to base
    command.downgrade(alembic_cfg, "base")

    # 3. Upgrade to head again (verifies idempotency)
    command.upgrade(alembic_cfg, "head")
