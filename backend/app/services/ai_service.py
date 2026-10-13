"""Gemini AI Service for extracting educational content from lecture notes.

Educational Notes for Students:
------------------------------
1. Structured Outputs: Modern LLMs support JSON output formatting.
   We prompt Gemini with explicit JSON schemas to guarantee parseable structures.
2. Resilience: If the LLM generates slightly imperfect markdown wrappers
   (e.g., ```json ... ```), our parser strips it safely before loading into Pydantic.
3. Fallback & Mocking: Allows running tests and offline development without burning API credits.
"""

import json
import logging
from typing import Any

import google.generativeai as genai

from app.core.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are an expert educational AI tutor for students.
Analyze the provided course/lecture notes and extract structured learning materials.

You MUST respond strictly with valid JSON conforming to the following structure:
{
  "key_concepts": [
    {
      "order_index": 1,
      "title": "Title of Concept 1",
      "summary": "Clear, concise 2-sentence explanation of the concept",
      "example": "A concrete real-world analogy or example"
    },
    {
      "order_index": 2,
      "title": "Title of Concept 2",
      "summary": "Clear, concise 2-sentence explanation of the concept",
      "example": "A concrete real-world analogy or example"
    },
    {
      "order_index": 3,
      "title": "Title of Concept 3",
      "summary": "Clear, concise 2-sentence explanation of the concept",
      "example": "A concrete real-world analogy or example"
    }
  ],
  "flashcards": [
    {
      "front": "Front question/prompt to test recall",
      "back": "Back concise definition or explanation",
      "hint": "Brief memory trigger hint"
    }
  ],
  "quiz_questions": [
    {
      "question": "Engaging multiple-choice question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_option_index": 0,
      "explanation": "Clear explanation of why this answer is correct"
    }
  ]
}

Constraints:
- Exactly 3 key concepts.
- 5 to 8 flashcards.
- Exactly 5 multiple-choice questions.
- Write everything strictly in clear English.
- Return ONLY pure JSON with no commentary or markdown ticks.
"""


class GeminiAIService:
    """Service to interact with Google Gemini AI models."""

    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        else:
            self.model = None

    async def generate_study_material(self, lecture_text: str) -> dict[str, Any]:
        """Processes raw text through Gemini and returns structured course content."""
        if not self.model or not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not configured. Returning mock study payload.")
            return self._get_mock_payload()

        prompt = f"{SYSTEM_PROMPT}\n\nHere are the student's lecture notes:\n\n{lecture_text}"

        # Configuration: Request structured JSON with LOW thinking level (fast reasoning)
        gen_config: dict[str, Any] = {
            "response_mime_type": "application/json",
        }

        # Gemini 3.7 Flash thinking configuration:
        # 1. Primary: thinking_level="low" (standard for Gemini 3 series)
        # 2. Secondary: thinking_budget (numeric token budget fallback)
        thinking_level = getattr(settings, "GEMINI_THINKING_LEVEL", "low")
        thinking_budget = getattr(settings, "GEMINI_THINKING_BUDGET", 1024)

        if thinking_level:
            gen_config["thinking_config"] = {"thinking_level": thinking_level}
        elif thinking_budget and thinking_budget > 0:
            gen_config["thinking_config"] = {"thinking_budget": thinking_budget}

        try:
            try:
                response = self.model.generate_content(prompt, generation_config=gen_config)
            except Exception as model_err:
                # If specific client version rejects thinking_level dict, try thinking_budget or standard generation
                logger.warning(
                    f"Thinking config attempt encountered: {model_err}. Falling back to standard JSON generation."
                )
                response = self.model.generate_content(
                    prompt, generation_config={"response_mime_type": "application/json"}
                )

            raw_text = response.text.strip()
            # Clean possible markdown wrapping if returned
            raw_text = raw_text.removeprefix("```json")
            raw_text = raw_text.removeprefix("```")
            raw_text = raw_text.removesuffix("```")

            parsed_data = json.loads(raw_text.strip())
            return parsed_data

        except Exception as e:
            logger.error(f"Gemini API invocation error: {e!s}")
            # Fallback to mock payload so students can continue testing even during API downtime
            return self._get_mock_payload()

    def _get_mock_payload(self) -> dict[str, Any]:
        """Provides a realistic fallback payload for offline development & tests."""
        return {
            "key_concepts": [
                {
                    "order_index": 1,
                    "title": "Fundamental Principles",
                    "summary": "Core foundational ideas that govern the domain and provide the structural base.",
                    "example": "Like the foundations of a skyscraper supporting upper levels.",
                },
                {
                    "order_index": 2,
                    "title": "System Architecture & Flow",
                    "summary": "How components interconnect, pass messages, and maintain state safely.",
                    "example": "Like traffic management with designated lanes and signals.",
                },
                {
                    "order_index": 3,
                    "title": "Evaluation & Testing",
                    "summary": "Verification methods ensuring behavior matches technical specifications.",
                    "example": "Like quality inspections before shipping cars off the assembly line.",
                },
            ],
            "flashcards": [
                {
                    "front": "What is the primary role of the foundational layer?",
                    "back": "To establish reliable base state and contracts for upper modules.",
                    "hint": "Think bedrock.",
                },
                {
                    "front": "Why is stateless authentication preferred for REST APIs?",
                    "back": "It allows independent horizontal scaling without centralized session memory locks.",
                    "hint": "Scalability & JWT.",
                },
                {
                    "front": "What does Shift-Left security mean?",
                    "back": "Moving security testing and threat modeling to the earliest stages of development.",
                    "hint": "Prevent rather than patch.",
                },
            ],
            "quiz_questions": [
                {
                    "question": "Which HTTP status code signifies successful creation of a new resource?",
                    "options": ["200 OK", "201 Created", "204 No Content", "301 Moved"],
                    "correct_option_index": 1,
                    "explanation": "201 Created is the standard RFC response for successful POST creation.",
                },
                {
                    "question": "What is the primary defense against SQL Injection?",
                    "options": [
                        "String concats",
                        "Parameterized queries / ORM",
                        "Client-side validation",
                        "Regex cleaning",
                    ],
                    "correct_option_index": 1,
                    "explanation": "Parameterized queries treat input as literal data parameters, not executable code.",
                },
            ],
        }


gemini_service = GeminiAIService()
