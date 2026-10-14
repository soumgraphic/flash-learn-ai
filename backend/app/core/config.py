"""Application configuration module using Pydantic Settings.

Educational Note for Students:
------------------------------
Using Pydantic Settings provides:
1. Strict type checking on startup (catches misconfigurations before traffic hits).
2. Centralized environment variable loading (no scattered os.environ calls).
3. Secret isolation (secrets are read from .env files or container environments,
   never hardcoded in source control).
"""

from __future__ import annotations

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application Info
    PROJECT_NAME: str = "FlashLearn AI API"
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"

    # Security Configuration
    # Important: In production, SECRET_KEY must be provided via container secret/env var
    SECRET_KEY: str = "insecure-dev-secret-key-replace-in-production-with-openssl"
    # Dual-key architecture: separate secret key for signing long-lived refresh tokens
    REFRESH_SECRET_KEY: str | None = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database Settings
    # Default to async SQLite for out-of-the-box local testing if postgres isn't running
    DATABASE_URL: str = "sqlite+aiosqlite:///./flashlearn_dev.db"

    # CORS Configuration
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return []

    # Gemini AI Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.7-flash"     # Google Gemini reasoning model
    GEMINI_THINKING_LEVEL: str = "low"         # Options: "low", "medium", "high"
    GEMINI_THINKING_BUDGET: int = 1024         # Token budget fallback for models using numeric limits

    # Rate Limiting
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_AI_GENERATE: str = "10/minute"

    # Transactional Email (Resend)
    RESEND_API_KEY: str | None = None
    EMAILS_FROM: str = "FlashLearn AI <onboarding@resend.dev>"
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )


settings = Settings()
