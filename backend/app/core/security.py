"""Security module: Password hashing, verification, and JWT generation.

Educational Notes for Students:
------------------------------
1. Passwords should NEVER be stored as plaintext or using fast hashing algorithms
   like MD5 or SHA256 (which are susceptible to GPU rainbow-table attacks).
   We use Bcrypt with passlib, which automatically incorporates salts and a cost factor.

2. JWT (JSON Web Tokens):
   - Access tokens are stateless and self-contained.
   - We sign tokens cryptographically with HMAC-SHA256 (HS256) and our server SECRET_KEY.
   - Short lifespans (e.g. 30 minutes) limit exposure if a token is intercepted.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# CryptContext configured with bcrypt. deprecated="auto" enables future algorithm migration.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies that a plain text password matches the stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generates a secure salted bcrypt hash from a plain text password."""
    return pwd_context.hash(password)


def create_access_token(
    subject: str | Any,
    expires_delta: timedelta | None = None,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    """Creates a cryptographically signed JWT Access Token.

    Args:
        subject: The unique identifier of the user (e.g., user.id).
        expires_delta: Optional custom duration; defaults to settings.ACCESS_TOKEN_EXPIRE_MINUTES.
        extra_claims: Optional dictionary with custom claims (e.g., role, email).
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: dict[str, Any] = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "type": "access",
    }
    if extra_claims:
        to_encode.update(extra_claims)

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def get_refresh_secret_key() -> str:
    """Returns the dedicated refresh token secret key or derives an isolated key."""
    return settings.REFRESH_SECRET_KEY or f"{settings.SECRET_KEY}-refresh-salt"


def create_refresh_token(subject: str | Any) -> str:
    """Creates a long-lived JWT Refresh Token signed with an isolated key."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode: dict[str, Any] = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "type": "refresh",
    }
    encoded_jwt = jwt.encode(to_encode, get_refresh_secret_key(), algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_refresh_token(token: str) -> dict[str, Any]:
    """Decodes and validates a refresh token, strictly enforcing refresh token type."""
    return jwt.decode(token, get_refresh_secret_key(), algorithms=[settings.ALGORITHM])
