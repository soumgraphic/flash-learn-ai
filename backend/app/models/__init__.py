"""Database Models for FlashLearn AI.

Educational Notes for Students:
------------------------------
1. Separation of Concerns: Database models represent the physical relational schema in PostgreSQL.
   We use UUID primary keys (or autoincrementing integers) and enforce foreign key constraints
   with cascading deletes to maintain referential integrity.
2. Relationships: One user has many courses/decks; one course has 3 key concepts, many flashcards,
   and quiz questions.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    """User account model with authentication credentials and gamification stats."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Gamification Attributes
    xp_points: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[int] = mapped_column(Integer, default=1)
    streak_days: Mapped[int] = mapped_column(Integer, default=1)

    # Audit Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    courses: Mapped[list["Course"]] = relationship(
        "Course",
        back_populates="owner",
        cascade="all, delete-orphan",
    )


class Course(Base):
    """Represents a student's study topic or uploaded lecture notes."""

    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    raw_content: Mapped[str] = mapped_column(Text, nullable=False)
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="courses")
    key_concepts: Mapped[list["KeyConcept"]] = relationship(
        "KeyConcept",
        back_populates="course",
        cascade="all, delete-orphan",
    )
    flashcards: Mapped[list["Flashcard"]] = relationship(
        "Flashcard",
        back_populates="course",
        cascade="all, delete-orphan",
    )
    quiz_questions: Mapped[list["QuizQuestion"]] = relationship(
        "QuizQuestion",
        back_populates="course",
        cascade="all, delete-orphan",
    )


class KeyConcept(Base):
    """One of the 3 fundamental notions extracted by Gemini AI from lecture notes."""

    __tablename__ = "key_concepts"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    course_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )
    order_index: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    example: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    course: Mapped["Course"] = relationship("Course", back_populates="key_concepts")


class Flashcard(Base):
    """Study flashcard with front prompt and back answer/hint."""

    __tablename__ = "flashcards"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    course_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )
    front: Mapped[str] = mapped_column(Text, nullable=False)
    back: Mapped[str] = mapped_column(Text, nullable=False)
    hint: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_mastered: Mapped[bool] = mapped_column(Boolean, default=False)
    times_reviewed: Mapped[int] = mapped_column(Integer, default=0)

    course: Mapped["Course"] = relationship("Course", back_populates="flashcards")


class QuizQuestion(Base):
    """Multiple Choice Question (MCQ) generated for gamified quiz mode."""

    __tablename__ = "quiz_questions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    course_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    option_a: Mapped[str] = mapped_column(String(255), nullable=False)
    option_b: Mapped[str] = mapped_column(String(255), nullable=False)
    option_c: Mapped[str] = mapped_column(String(255), nullable=False)
    option_d: Mapped[str] = mapped_column(String(255), nullable=False)
    correct_option_index: Mapped[int] = mapped_column(Integer, nullable=False)  # 0, 1, 2, or 3
    explanation: Mapped[str] = mapped_column(Text, nullable=False)

    course: Mapped["Course"] = relationship("Course", back_populates="quiz_questions")
