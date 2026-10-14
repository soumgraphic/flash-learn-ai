"""Tests for AI course generation and mock pipeline.

Educational Notes for Students:
------------------------------
1. CI Isolation: In CI pipelines, we do not want tests depending on third-party API quotas
   or network latency. We test the complete controller, database insertion, and serialization
   layers using the fallback/mock pipeline.
"""

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_generate_course_success(client: AsyncClient):
    """Verify student can generate key concepts, flashcards, and quizzes from lecture notes."""
    # 1. Register and login student
    reg_payload = {
        "email": "generator_student@example.com",
        "password": "Password123!",
        "full_name": "Charlie Generator",
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    login_res = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "generator_student@example.com",
            "password": "Password123!",
        },
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Post lecture notes (minimum 50 chars as required by schema)
    generate_payload = {
        "title": "Introduction to Distributed Computing",
        "lecture_text": (
            "Distributed computing is a field of computer science that studies distributed systems. "
            "A distributed system is a system whose components are located on different networked computers, "
            "which communicate and coordinate their actions by passing messages to one another from any system. "
            "The components interact with one another in order to achieve a common goal."
        ),
    }

    gen_res = await client.post("/api/v1/courses/generate", json=generate_payload, headers=headers)
    assert gen_res.status_code == 201
    course_data = gen_res.json()

    assert "id" in course_data
    assert course_data["title"] == "Introduction to Distributed Computing"

    # Verify 3 Key Concepts were extracted
    assert len(course_data["key_concepts"]) == 3
    assert course_data["key_concepts"][0]["order_index"] == 1
    assert "summary" in course_data["key_concepts"][0]

    # Verify Flashcards were generated
    assert len(course_data["flashcards"]) >= 3
    assert "front" in course_data["flashcards"][0]
    assert "back" in course_data["flashcards"][0]

    # Verify Quiz questions were generated
    assert len(course_data["quiz_questions"]) >= 2
    assert len(course_data["quiz_questions"][0]["options"]) == 4

    # 3. Verify student earned +50 XP
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["xp_points"] == 50

    # 4. List user courses
    list_res = await client.get("/api/v1/courses/", headers=headers)
    assert list_res.status_code == 200
    courses_list = list_res.json()
    assert len(courses_list) >= 1
    first_summary = courses_list[0]
    assert first_summary["id"] == course_data["id"]
    assert first_summary["is_completed"] is False
    assert first_summary["concepts_count"] == 3
    assert first_summary["flashcards_count"] >= 3

    # 5. Fetch single course detail
    detail_res = await client.get(f"/api/v1/courses/{course_data['id']}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == course_data["id"]

    # 6. Complete course and verify bonus +100 XP (Total: 150 XP, Level 2)
    complete_res = await client.post(
        f"/api/v1/courses/{course_data['id']}/complete", headers=headers
    )
    assert complete_res.status_code == 200
    complete_data = complete_res.json()
    assert complete_data["is_completed"] is True
    assert complete_data["xp_awarded"] == 100
    assert complete_data["total_xp"] == 150
    assert complete_data["level"] == 2

    # Verify idempotency (second completion attempt awards 0 bonus XP)
    repeat_res = await client.post(
        f"/api/v1/courses/{course_data['id']}/complete", headers=headers
    )
    assert repeat_res.status_code == 200
    assert repeat_res.json()["xp_awarded"] == 0
    assert repeat_res.json()["total_xp"] == 150
