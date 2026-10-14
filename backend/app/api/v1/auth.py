"""Authentication router (HTTP Controller) handling User Registration, Login, and Profile.

Educational Notes for Students:
------------------------------
1. Controller Responsibility: This file only handles HTTP concerns:
   - Reading request parameters & validation schemas.
   - Invoking the rate limiter.
   - Delegating business logic to `auth_service`.
   - Returning standard HTTP response codes (201 Created, 200 OK).
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.models import User
from app.schemas import (
    ForgotPasswordRequest,
    MessageResponse,
    RefreshTokenRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student account",
)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
async def register_user(
    request: Request,
    payload: UserRegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Register a new student. Enforces unique email and hashed password storage."""
    return await auth_service.register_student(db=db, payload=payload)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate student and obtain JWT tokens",
)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
async def login_user(
    request: Request,
    payload: UserLoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Authenticate via email & password and receive an access token pair."""
    return await auth_service.authenticate_student(db=db, payload=payload)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Rotate refresh token and issue a fresh access token",
)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
async def refresh_token(
    request: Request,
    payload: RefreshTokenRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Exchanges a valid refresh token for a newly signed access/refresh token pair."""
    return await auth_service.refresh_student_token(db=db, refresh_token=payload.refresh_token)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get authenticated student's profile & gamification progress",
)
async def get_current_user_profile(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Returns the authenticated student profile with XP, level, and study stats."""
    return current_user


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request a password reset link (Blind success response)",
)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
async def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Dispatches a single-use password reset link to the user's email if registered."""
    msg = await auth_service.request_password_reset(db=db, email=payload.email)
    return MessageResponse(message=msg)


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset password using valid reset token",
)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
async def reset_password(
    request: Request,
    payload: ResetPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Validates single-use token and updates user password with Bcrypt hash."""
    msg = await auth_service.reset_password(
        db=db, token=payload.token, new_password=payload.new_password
    )
    return MessageResponse(message=msg)
