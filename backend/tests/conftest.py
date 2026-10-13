"""Pytest test configuration and database fixtures for isolated testing.

Educational Notes for Students:
------------------------------
1. In-Memory SQLite: We use an in-memory SQLite database (`sqlite+aiosqlite:///:memory:`)
   during automated tests. This ensures tests are fast, reproducible, and have zero side-effects
   on development or production databases.
2. Async Fixtures: `AsyncClient` from `httpx` allows making async requests directly against
   FastAPI's ASGI handler without binding to an open operating system port.
"""

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.core.limiter import limiter
from app.main import app

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest_asyncio.fixture(scope="function")
async def db_session():
    """Provides a clean in-memory database session for each test function."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession):
    """FastAPI async test client with database dependency override and disabled rate limiting."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    limiter.enabled = False  # Disable rate limiter for automated testing
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
    limiter.enabled = True
