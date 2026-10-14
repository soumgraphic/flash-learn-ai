"""Unit and integration tests for Authentication and Security.

Educational Notes for Students:
------------------------------
Testing authentication validates the cornerstone of application security:
1. Valid registrations return HTTP 201 with clean JSON (password hashes are never exposed).
2. Duplicate registration attempts fail safely with HTTP 400.
3. Invalid passwords return HTTP 401.
4. Protected routes (/me) reject missing or invalid tokens with HTTP 401.
"""

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_health_check(client: AsyncClient):
    """Verify application liveness probe works."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


async def test_user_registration_success(client: AsyncClient):
    """Verify new student can register successfully."""
    payload = {
        "email": "student@example.com",
        "password": "StrongPassword123!",
        "full_name": "Alice Student",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "student@example.com"
    assert data["full_name"] == "Alice Student"
    assert "id" in data
    # Security verification: hashed password must NEVER leak in API responses
    assert "password" not in data
    assert "hashed_password" not in data


async def test_duplicate_registration_fails(client: AsyncClient):
    """Verify registering an existing email fails safely."""
    payload = {
        "email": "duplicate@example.com",
        "password": "StrongPassword123!",
    }
    # Register once
    res1 = await client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    # Attempt duplicate
    res2 = await client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


async def test_login_success_and_me_profile(client: AsyncClient):
    """Verify student login receives JWT and accesses protected /me profile."""
    # 1. Register student
    reg_payload = {
        "email": "login_test@example.com",
        "password": "CorrectPassword123!",
        "full_name": "Bob Test",
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    # 2. Login
    login_payload = {
        "email": "login_test@example.com",
        "password": "CorrectPassword123!",
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    # 3. Access protected /me endpoint
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "login_test@example.com"
    assert me_data["full_name"] == "Bob Test"


async def test_login_invalid_password_fails(client: AsyncClient):
    """Verify wrong password returns 401."""
    reg_payload = {
        "email": "wrong_pw@example.com",
        "password": "CorrectPassword123!",
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    wrong_login = {
        "email": "wrong_pw@example.com",
        "password": "WrongPassword999!",
    }
    res = await client.post("/api/v1/auth/login", json=wrong_login)
    assert res.status_code == 401
    assert "Incorrect email or password" in res.json()["detail"]


async def test_protected_route_without_token_fails(client: AsyncClient):
    """Verify unauthenticated requests to protected endpoints return 401."""
    res = await client.get("/api/v1/auth/me")
    assert res.status_code == 401


async def test_refresh_token_rotation_success(client: AsyncClient):
    """Verify refresh token can issue new token pairs."""
    reg_payload = {
        "email": "refresh_user@example.com",
        "password": "SecurePassword123!",
        "full_name": "Rotation Tester",
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "refresh_user@example.com", "password": "SecurePassword123!"},
    )
    assert login_res.status_code == 200
    refresh_token = login_res.json()["refresh_token"]

    # Exchange refresh token for fresh pair
    refresh_res = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    new_data = refresh_res.json()
    assert "access_token" in new_data
    assert "refresh_token" in new_data


async def test_refresh_token_rejects_access_token_or_garbage(client: AsyncClient):
    """Verify token type confusion attack is blocked (access token passed to refresh)."""
    reg_payload = {
        "email": "reject_token_user@example.com",
        "password": "SecurePassword123!",
        "full_name": "Reject Tester",
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "reject_token_user@example.com", "password": "SecurePassword123!"},
    )
    assert login_res.status_code == 200
    access_token = login_res.json()["access_token"]

    # Pass access token instead of refresh token
    bad_res = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": access_token},
    )
    assert bad_res.status_code == 401
