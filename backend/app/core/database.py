"""Asynchronous Database Session and Engine setup using SQLAlchemy 2.0.

Educational Notes for Students:
------------------------------
1. Modern FastAPI applications should use non-blocking asynchronous database drivers
   (e.g., asyncpg for PostgreSQL, aiosqlite for SQLite).
2. Dependency Injection: The `get_db` generator is injected into route handlers.
   It guarantees that each HTTP request operates within its own transaction/session
   and cleanly closes or rolls back on unhandled errors.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


# Base class for all declarative database models
class Base(DeclarativeBase):
    pass


# Asynchronous SQLAlchemy Engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.ENVIRONMENT == "development"),
    future=True,
    pool_pre_ping=True,  # Automatically tests connection vitality to avoid stale socket drops
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency to yield an isolated async database session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
