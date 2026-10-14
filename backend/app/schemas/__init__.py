"""Pydantic v2 schemas for request validation and response serialization.

Educational Notes for Students:
------------------------------
1. Strict Validation: Pydantic v2 validates inputs *before* reaching controller logic.
   Email formats, password complexity, and content length are enforced automatically.
2. Zero Data Leak: By using `model_config = ConfigDict(from_attributes=True)` and explicitly
   defining response fields, we guarantee sensitive columns like `hashed_password` are never
   accidentally returned in an API response.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# -----------------------------------------------------------------------------
# Authentication & User Schemas
# -----------------------------------------------------------------------------


class UserRegisterRequest(BaseModel):
    """Payload sent by client when registering a new account."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128, description="Must be at least 8 characters")
    full_name: str | None = Field(default=None, max_length=100)

    model_config = ConfigDict(extra="forbid")


class UserLoginRequest(BaseModel):
    """Payload sent by client to authenticate."""

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    model_config = ConfigDict(extra="forbid")


class ForgotPasswordRequest(BaseModel):
    """Payload to request a password reset link."""

    email: EmailStr

    model_config = ConfigDict(extra="forbid")


class ResetPasswordRequest(BaseModel):
    """Payload to finalize password reset using received token."""

    token: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=128, description="Must be at least 8 characters")

    model_config = ConfigDict(extra="forbid")


class MessageResponse(BaseModel):
    """Generic message response schema."""

    message: str


class TokenResponse(BaseModel):
    """Standard OAuth2 / JWT bearer token response."""

    access_token: str
    token_type: str = "bearer"
    refresh_token: str
    expires_in: int


class UserResponse(BaseModel):
    """Safe public user profile representation."""

    id: str
    email: EmailStr
    full_name: str | None = None
    is_active: bool
    xp_points: int
    level: int
    streak_days: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------------------------------------------
# AI Course Generation & Content Schemas
# -----------------------------------------------------------------------------


class CourseGenerateRequest(BaseModel):
    """Payload containing raw lecture notes for AI parsing."""

    title: str | None = Field(default="Untitled Study Session", max_length=200)
    lecture_text: str = Field(
        min_length=50,
        max_length=20000,
        description="Raw lecture extract pasted by the student",
    )

    model_config = ConfigDict(extra="forbid")


class KeyConceptSchema(BaseModel):
    id: str | None = None
    order_index: int
    title: str
    summary: str
    example: str | None = None

    model_config = ConfigDict(from_attributes=True)


class FlashcardSchema(BaseModel):
    id: str | None = None
    front: str
    back: str
    hint: str | None = None
    is_mastered: bool = False
    times_reviewed: int = 0

    model_config = ConfigDict(from_attributes=True)


class QuizQuestionSchema(BaseModel):
    id: str | None = None
    question: str
    options: list[str] = Field(min_length=4, max_length=4)
    correct_option_index: int = Field(ge=0, le=3)
    explanation: str

    model_config = ConfigDict(from_attributes=True)


class RefreshTokenRequest(BaseModel):
    """Payload to exchange a valid refresh token for a fresh access token."""

    refresh_token: str = Field(min_length=1)

    model_config = ConfigDict(extra="forbid")


class CourseSummaryResponse(BaseModel):
    """Concise representation of a student's study deck for course listing and profile."""

    id: str
    title: str
    created_at: datetime
    is_completed: bool = False
    xp_earned: int = 50
    completed_at: datetime | None = None
    concepts_count: int = 0
    flashcards_count: int = 0
    quiz_questions_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class CourseCompleteResponse(BaseModel):
    """Gamified completion result returning bonus XP and updated student level."""

    course_id: str
    is_completed: bool
    xp_awarded: int
    total_xp: int
    level: int
    message: str


class CourseDetailResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    is_completed: bool = False
    xp_earned: int = 50
    completed_at: datetime | None = None
    key_concepts: list[KeyConceptSchema]
    flashcards: list[FlashcardSchema]
    quiz_questions: list[QuizQuestionSchema]

    model_config = ConfigDict(from_attributes=True)
