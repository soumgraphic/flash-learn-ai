"""Course & Study Material Domain Service.

Educational Notes for Students:
------------------------------
1. Pure Domain Logic: Raises `ResourceNotFoundError` when an entity is missing,
   keeping database and service layers free from HTTP awareness.
"""

from __future__ import annotations

from typing import Any, Dict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ResourceNotFoundError
from app.models import Course, Flashcard, KeyConcept, QuizQuestion, User
from app.schemas import CourseDetailResponse, CourseGenerateRequest
from app.services.ai_service import gemini_service


class CourseService:
    """Manages creation, AI parsing, and retrieval of study decks."""

    async def generate_and_save_course(
        self,
        db: AsyncSession,
        current_user: User,
        payload: CourseGenerateRequest,
    ) -> CourseDetailResponse:
        """Processes raw notes with Gemini AI and stores course entities atomically."""
        # 1. AI Content Generation
        ai_data: Dict[str, Any] = await gemini_service.generate_study_material(payload.lecture_text)

        # 2. Create Course parent record
        course = Course(
            title=payload.title or "Untitled Study Session",
            raw_content=payload.lecture_text,
            user_id=current_user.id,
        )
        db.add(course)
        await db.flush()  # Populates course.id for children foreign keys

        # 3. Create Key Concepts (exactly 3)
        concepts = [
            KeyConcept(
                course_id=course.id,
                order_index=item.get("order_index", idx + 1),
                title=item.get("title", f"Concept {idx + 1}"),
                summary=item.get("summary", ""),
                example=item.get("example"),
            )
            for idx, item in enumerate(ai_data.get("key_concepts", []))
        ]
        db.add_all(concepts)

        # 4. Create Flashcards
        flashcards = [
            Flashcard(
                course_id=course.id,
                front=item.get("front", ""),
                back=item.get("back", ""),
                hint=item.get("hint"),
            )
            for item in ai_data.get("flashcards", [])
        ]
        db.add_all(flashcards)

        # 5. Create Quiz Questions
        quizzes = []
        for item in ai_data.get("quiz_questions", []):
            opts = item.get("options", ["A", "B", "C", "D"])
            while len(opts) < 4:
                opts.append("N/A")

            qq = QuizQuestion(
                course_id=course.id,
                question=item.get("question", ""),
                option_a=opts[0],
                option_b=opts[1],
                option_c=opts[2],
                option_d=opts[3],
                correct_option_index=item.get("correct_option_index", 0),
                explanation=item.get("explanation", ""),
            )
            quizzes.append(qq)
        db.add_all(quizzes)

        # 6. Gamification: Award 50 XP
        current_user.xp_points += 50
        db.add(current_user)

        # Atomic commit
        await db.commit()

        # 7. Reload with relationships eager-loaded
        saved_course = await self.get_course_by_id(
            db=db, course_id=course.id, user_id=current_user.id
        )
        return self._serialize_course(saved_course)

    async def get_course_by_id(self, db: AsyncSession, course_id: str, user_id: str) -> Course:
        """Fetches a specific course ensuring ownership by user_id."""
        query = (
            select(Course)
            .where(Course.id == course_id, Course.user_id == user_id)
            .options(
                selectinload(Course.key_concepts),
                selectinload(Course.flashcards),
                selectinload(Course.quiz_questions),
            )
        )
        result = await db.execute(query)
        course = result.scalar_one_or_none()

        if not course:
            raise ResourceNotFoundError("Course not found")

        return course

    def _serialize_course(self, course: Course) -> CourseDetailResponse:
        """Transforms Course ORM into standard response schema."""
        return CourseDetailResponse(
            id=course.id,
            title=course.title,
            created_at=course.created_at,
            key_concepts=[
                {
                    "id": c.id,
                    "order_index": c.order_index,
                    "title": c.title,
                    "summary": c.summary,
                    "example": c.example,
                }
                for c in course.key_concepts
            ],
            flashcards=[
                {
                    "id": f.id,
                    "front": f.front,
                    "back": f.back,
                    "hint": f.hint,
                    "is_mastered": f.is_mastered,
                    "times_reviewed": f.times_reviewed,
                }
                for f in course.flashcards
            ],
            quiz_questions=[
                {
                    "id": q.id,
                    "question": q.question,
                    "options": [q.option_a, q.option_b, q.option_c, q.option_d],
                    "correct_option_index": q.correct_option_index,
                    "explanation": q.explanation,
                }
                for q in course.quiz_questions
            ],
        )


course_service = CourseService()
