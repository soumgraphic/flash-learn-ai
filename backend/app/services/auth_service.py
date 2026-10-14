"""Authentication & User Domain Service.

Educational Notes for Students:
------------------------------
1. Pure Python Domain Logic: This service raises domain exceptions
   (e.g., `UserAlreadyExistsError`, `InvalidCredentialsError`) instead of `HTTPException`.
   This ensures business logic can be reused in non-HTTP contexts (CLI, message queues).
"""

from __future__ import annotations

import logging

from jose import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    InactiveUserError,
    InvalidCredentialsError,
    UserAlreadyExistsError,
)
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    decode_password_reset_token,
    decode_refresh_token,
    get_password_hash,
    verify_password,
)
from app.models import User
from app.schemas import TokenResponse, UserLoginRequest, UserRegisterRequest

logger = logging.getLogger("flashlearn.auth")


class AuthService:
    """Encapsulates business operations for user authentication and accounts."""

    async def register_student(self, db: AsyncSession, payload: UserRegisterRequest) -> User:
        """Validates unique email and registers a new student."""
        # 1. Enforce unique email check
        existing = await db.execute(select(User).where(User.email == payload.email.lower()))
        if existing.scalar_one_or_none():
            raise UserAlreadyExistsError("An account with this email address already exists.")

        # 2. Hash password & persist user
        new_user = User(
            email=payload.email.lower(),
            hashed_password=get_password_hash(payload.password),
            full_name=payload.full_name,
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user

    async def authenticate_student(
        self, db: AsyncSession, payload: UserLoginRequest
    ) -> TokenResponse:
        """Verifies credentials and issues a signed JWT token pair."""
        result = await db.execute(select(User).where(User.email == payload.email.lower()))
        user = result.scalar_one_or_none()

        if not user or not verify_password(payload.password, user.hashed_password):
            # Generic domain exception prevents user enumeration
            raise InvalidCredentialsError("Incorrect email or password.")

        if not user.is_active:
            raise InactiveUserError("User account is disabled.")

        # Generate tokens
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def refresh_student_token(
        self, db: AsyncSession, refresh_token: str
    ) -> TokenResponse:
        """Validates a refresh token and issues a fresh token pair (Token Rotation)."""
        try:
            payload = decode_refresh_token(refresh_token)
            user_id = payload.get("sub")
            token_type = payload.get("type")

            if not user_id or token_type != "refresh":
                raise InvalidCredentialsError("Invalid refresh token type.")
        except Exception as err:
            raise InvalidCredentialsError("Invalid or expired refresh token.") from err

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise InvalidCredentialsError("User account not found.")
        if not user.is_active:
            raise InactiveUserError("User account is disabled.")

        new_access_token = create_access_token(subject=user.id)
        new_refresh_token = create_refresh_token(subject=user.id)

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def request_password_reset(self, db: AsyncSession, email: str) -> str:
        """Initiates password reset flow with zero user-enumeration leak.

        Security Design:
        Always returns a blind success message regardless of whether the email exists.
        If the email is valid, generates a signed 15-minute token and logs/dispatches the reset link.
        """
        result = await db.execute(select(User).where(User.email == email.lower()))
        user = result.scalar_one_or_none()

        if user and user.is_active:
            reset_token = create_password_reset_token(
                email=user.email,
                current_hashed_password=user.hashed_password,
            )
            logger.info(
                f"[PASSWORD RESET] Password reset requested for {user.email}. "
                f"Reset Token: {reset_token}"
            )

        return "If an account with this email exists, a password reset link has been sent."

    async def reset_password(
        self, db: AsyncSession, token: str, new_password: str
    ) -> str:
        """Validates reset token and securely updates password."""
        try:
            unverified = jwt.get_unverified_claims(token)
            email = unverified.get("sub")
            token_type = unverified.get("type")

            if not email or token_type != "password_reset":
                raise InvalidCredentialsError("Invalid or expired password reset link.")
        except Exception as err:
            raise InvalidCredentialsError("Invalid or expired password reset link.") from err

        result = await db.execute(select(User).where(User.email == email.lower()))
        user = result.scalar_one_or_none()

        if not user or not user.is_active:
            raise InvalidCredentialsError("Invalid or expired password reset link.")

        try:
            payload = decode_password_reset_token(
                token=token,
                current_hashed_password=user.hashed_password,
            )
            if payload.get("sub") != user.email:
                raise InvalidCredentialsError("Invalid or expired password reset link.")
        except Exception as err:
            raise InvalidCredentialsError("Invalid or expired password reset link.") from err

        user.hashed_password = get_password_hash(new_password)
        db.add(user)
        await db.commit()

        logger.info(f"[PASSWORD RESET] Password successfully reset for user: {user.email}")
        return "Your password has been successfully reset. You can now log in."


auth_service = AuthService()
