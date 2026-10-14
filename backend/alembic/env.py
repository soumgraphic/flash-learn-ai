"""Alembic environment configuration for Asynchronous SQLAlchemy migrations.

Educational Notes for Students:
------------------------------
1. What is a Migration?
   A database migration is version control for your database schema. Just like git tracks
   changes to code files, Alembic tracks changes to relational tables, columns, indexes, and keys.
2. Why not just use `Base.metadata.create_all()`?
   `create_all()` only creates tables if they do NOT exist. It CANNOT add new columns, alter types,
   or drop columns on existing production tables where customer data already lives.
3. How does Alembic track state?
   Alembic maintains an `alembic_version` table in the database containing the current revision hash.
   Running `alembic upgrade head` applies any migrations newer than the stored version.
"""

import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context
from app.core.config import settings
from app.models import Base

# Alembic Config object provides access to alembic.ini values
config = context.config

# Dynamically set sqlalchemy.url from our validated pydantic settings
# (ensuring credentials are read from environment/Secret Manager, never hardcoded)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Configure logging if an alembic.ini config file exists
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for 'autogenerate' detection
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    Generates SQL DDL statements directly without establishing a live database connection.
    Useful for generating SQL review scripts for DBAs.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Runs migrations within an active synchronous connection wrapper."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,  # Detects column type changes
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Creates an AsyncEngine and executes migrations asynchronously."""
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = settings.DATABASE_URL

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode against a live database instance."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
