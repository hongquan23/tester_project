"""Unit tests cho crud/user_attempt.py."""
from datetime import datetime

import pytest
from models.user_attempt import UserAttempt
from models.question_base import QuestionBase
from schemas.user_attempt import UserAttemptCreate, UserAttemptUpdate
from crud import user_attempt as crud


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _create_attempt(db, user_id, section_id, question_id,
                    user_ans="A", is_correct=True, created_at=None):
    attempt = UserAttempt(
        user_id=user_id,
        section_id=section_id,
        question_id=question_id,
        user_ans=user_ans,
        is_correct=is_correct,
        created_at=created_at or datetime(2024, 6, 1, 9, 0, 0),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


# ---------------------------------------------------------------------------
# CRUD cơ bản
# ---------------------------------------------------------------------------

class TestCreateAttempt:
    def test_create_returns_attempt_with_id(self, db, sample_user, sample_section, sample_question_base):
        data = UserAttemptCreate(
            user_id=sample_user.id,
            section_id=sample_section.id,
            question_id=sample_question_base.id,
            user_ans="B",
        )
        attempt = crud.create(db, data)
        assert attempt.id is not None
        assert attempt.user_ans == "B"
        assert attempt.user_id == sample_user.id

    def test_create_with_null_user_ans(self, db, sample_user, sample_section, sample_question_base):
        data = UserAttemptCreate(
            user_id=sample_user.id,
            section_id=sample_section.id,
            question_id=sample_question_base.id,
        )
        attempt = crud.create(db, data)
        assert attempt.user_ans is None


class TestGetAttempt:
    def test_get_by_id_returns_attempt(self, db, sample_attempt):
        found = crud.get_by_id(db, sample_attempt.id)
        assert found is not None
        assert found.id == sample_attempt.id

    def test_get_by_id_not_found_returns_none(self, db):
        assert crud.get_by_id(db, 99999) is None

    def test_get_by_user_returns_list(self, db, sample_attempt):
        results = crud.get_by_user(db, sample_attempt.user_id)
        assert len(results) >= 1
        assert all(a.user_id == sample_attempt.user_id for a in results)

    def test_get_by_user_ordered_desc(self, db, sample_user, sample_section, sample_question_base):
        t1 = datetime(2024, 1, 1, 8, 0, 0)
        t2 = datetime(2024, 1, 2, 8, 0, 0)
        _create_attempt(db, sample_user.id, sample_section.id, sample_question_base.id, created_at=t1)
        _create_attempt(db, sample_user.id, sample_section.id, sample_question_base.id, created_at=t2)
        results = crud.get_by_user(db, sample_user.id)
        assert results[0].created_at >= results[-1].created_at

    def test_get_by_user_empty_returns_empty_list(self, db):
        assert crud.get_by_user(db, 99999) == []

    def test_get_by_user_section(self, db, sample_attempt):
        results = crud.get_by_user_section(db, sample_attempt.user_id, sample_attempt.section_id)
        assert len(results) >= 1
        assert all(
            a.user_id == sample_attempt.user_id and a.section_id == sample_attempt.section_id
            for a in results
        )

    def test_get_by_question_returns_first_attempt(self, db, sample_attempt):
        found = crud.get_by_question(db, sample_attempt.question_id)
        assert found is not None
        assert found.question_id == sample_attempt.question_id


class TestUpdateAttempt:
    def test_update_user_ans(self, db, sample_attempt):
        data = UserAttemptUpdate(user_ans="C")
        updated = crud.update(db, sample_attempt, data)
        assert updated.user_ans == "C"

    def test_update_ai_ans(self, db, sample_attempt):
        data = UserAttemptUpdate(ai_ans="Good job!")
        updated = crud.update(db, sample_attempt, data)
        assert updated.ai_ans == "Good job!"

    def test_update_partial_does_not_clear_other_fields(self, db, sample_attempt):
        original_user_ans = sample_attempt.user_ans
        data = UserAttemptUpdate(ai_ans="Comment")
        updated = crud.update(db, sample_attempt, data)
        assert updated.user_ans == original_user_ans
        assert updated.ai_ans == "Comment"


class TestDeleteAttempt:
    def test_delete_removes_from_db(self, db, sample_attempt):
        attempt_id = sample_attempt.id
        crud.delete(db, sample_attempt)
        assert crud.get_by_id(db, attempt_id) is None


# ---------------------------------------------------------------------------
# Chatbot context
# ---------------------------------------------------------------------------

class TestGetChatbotContext:
    def test_no_data_returns_has_data_false(self, db):
        result = crud.get_chatbot_context(db, user_id=99999)
        assert result["has_data"] is False

    def test_with_data_returns_has_data_true(self, db, sample_attempt):
        result = crud.get_chatbot_context(db, user_id=sample_attempt.user_id)
        assert result["has_data"] is True

    def test_context_contains_expected_keys(self, db, sample_attempt):
        result = crud.get_chatbot_context(db, user_id=sample_attempt.user_id)
        for key in ("total_sessions", "avg_score_pct", "most_practiced_skill", "recent_sessions"):
            assert key in result

    def test_recent_sessions_not_more_than_five(self, db, sample_user, sample_section, sample_question_base):
        for day in range(1, 8):  # 7 phiên
            _create_attempt(
                db,
                sample_user.id,
                sample_section.id,
                sample_question_base.id,
                created_at=datetime(2024, 1, day, 10, 0, 0),
            )
        result = crud.get_chatbot_context(db, user_id=sample_user.id)
        assert len(result["recent_sessions"]) <= 5

    def test_trend_none_when_fewer_than_4_sessions(self, db, sample_attempt):
        result = crud.get_chatbot_context(db, user_id=sample_attempt.user_id)
        assert result["trend"] is None


# ---------------------------------------------------------------------------
# Weak areas
# ---------------------------------------------------------------------------

class TestGetWeakAreas:
    def test_returns_expected_structure(self, db, sample_user):
        result = crud.get_weak_areas(db, user_id=sample_user.id)
        assert "weak_areas" in result
        assert "skill_accuracy" in result
        assert "total_mcq_attempts" in result

    def test_no_attempts_returns_zero_counts(self, db, sample_user):
        result = crud.get_weak_areas(db, user_id=sample_user.id)
        assert result["total_mcq_attempts"] == 0
        assert result["weak_areas"] == []

    def test_counts_answered_attempts(self, db, sample_user, sample_section, sample_question_base):
        # Tạo 3 attempt có is_correct và user_ans (không phải None)
        for i in range(3):
            _create_attempt(
                db,
                sample_user.id,
                sample_section.id,
                sample_question_base.id,
                is_correct=(i % 2 == 0),
            )
        result = crud.get_weak_areas(db, user_id=sample_user.id)
        assert result["total_mcq_attempts"] == 3
