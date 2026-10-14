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
from sqlalchemy.ext.asyncio import AsyncSession

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


async def test_forgot_password_blind_response(client: AsyncClient):
    """Verify forgot-password always returns identical success message (zero user-enumeration)."""
    # 1. Non-existent email
    res1 = await client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "nonexistent_person_12345@example.com"},
    )
    assert res1.status_code == 200
    assert "If an account with this email exists" in res1.json()["message"]

    # 2. Existing registered email
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "forgot_user@example.com",
            "password": "Password123!",
            "full_name": "Forgot Tester",
        },
    )
    res2 = await client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "forgot_user@example.com"},
    )
    assert res2.status_code == 200
    # Must match the non-existent response exactly
    assert res2.json()["message"] == res1.json()["message"]


async def test_reset_password_flow_and_single_use(
    client: AsyncClient, db_session: AsyncSession
):
    """Verify password reset succeeds and token is strictly single-use."""
    from sqlalchemy import select

    from app.core.security import create_password_reset_token
    from app.models import User

    # 1. Register student
    email = "reset_flow_user@example.com"
    old_pw = "OldPassword123!"
    new_pw = "NewPassword456!"

    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": old_pw, "full_name": "Reset Tester"},
    )

    # 2. Generate valid reset token using current user state
    user = (await db_session.execute(select(User).where(User.email == email))).scalar_one()
    reset_token = create_password_reset_token(user.email, user.hashed_password)

    # 3. Reset password via endpoint
    reset_res = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": reset_token, "new_password": new_pw},
    )
    assert reset_res.status_code == 200
    assert "successfully reset" in reset_res.json()["message"]

    # 4. Old password must be rejected
    fail_login = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": old_pw},
    )
    assert fail_login.status_code == 401

    # 5. New password must succeed
    good_login = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": new_pw},
    )
    assert good_login.status_code == 200
    assert "access_token" in good_login.json()

    # 6. Reusing the SAME token must FAIL (single-use guarantee)
    reuse_res = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": reset_token, "new_password": "EvenNewerPassword789!"},
    )
    assert reuse_res.status_code == 401
