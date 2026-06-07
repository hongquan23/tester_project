"""Integration tests cho api/routes/user_attempt.py — dùng TestClient + SQLite."""
from datetime import datetime


# ---------------------------------------------------------------------------
# Auth middleware
# ---------------------------------------------------------------------------

class TestAuthMiddleware:
    def test_request_without_token_returns_401(self, client):
        resp = client.get("/api/user-attempts/user/1")
        assert resp.status_code == 401

    def test_request_with_invalid_token_returns_401(self, client):
        resp = client.get(
            "/api/user-attempts/user/1",
            headers={"Authorization": "Bearer bad.token.here"},
        )
        assert resp.status_code == 401

    def test_request_with_valid_token_passes_middleware(self, client, auth_headers, sample_user):
        resp = client.get(f"/api/user-attempts/user/{sample_user.id}", headers=auth_headers)
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# POST /api/user-attempts/
# ---------------------------------------------------------------------------

class TestCreateAttemptRoute:
    def test_create_attempt_returns_201_or_200(self, client, auth_headers,
                                               sample_user, sample_section, sample_question_base):
        payload = {
            "user_id": sample_user.id,
            "section_id": sample_section.id,
            "question_id": sample_question_base.id,
            "user_ans": "B",
        }
        resp = client.post("/api/user-attempts/", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["user_ans"] == "B"
        assert data["id"] is not None

    def test_create_attempt_null_user_ans(self, client, auth_headers,
                                          sample_user, sample_section, sample_question_base):
        payload = {
            "user_id": sample_user.id,
            "section_id": sample_section.id,
            "question_id": sample_question_base.id,
        }
        resp = client.post("/api/user-attempts/", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["user_ans"] is None


# ---------------------------------------------------------------------------
# POST /api/user-attempts/submit-mcq
# ---------------------------------------------------------------------------

class TestSubmitMCQ:
    def test_submit_mcq_listening_correct_answer(
        self, client, auth_headers,
        sample_user, sample_section,
        sample_listening_question, sample_question_base,
    ):
        payload = {
            "user_id": sample_user.id,
            "section_id": sample_section.id,
            "skill": "listening",
            "answers": {str(sample_listening_question.id): "A"},
        }
        resp = client.post("/api/user-attempts/submit-mcq", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["score"] == 1
        assert data["total"] >= 1
        assert data["section_id"] == sample_section.id

    def test_submit_mcq_wrong_answer_gives_zero_score(
        self, client, auth_headers,
        sample_user, sample_section,
        sample_listening_question, sample_question_base,
    ):
        payload = {
            "user_id": sample_user.id,
            "section_id": sample_section.id,
            "skill": "listening",
            "answers": {str(sample_listening_question.id): "D"},
        }
        resp = client.post("/api/user-attempts/submit-mcq", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["score"] == 0

    def test_submit_mcq_skipped_question_saved_as_false(
        self, client, auth_headers,
        db, sample_user, sample_section,
        sample_listening_question, sample_question_base,
    ):
        # Gửi answers rỗng — câu bị bỏ qua
        payload = {
            "user_id": sample_user.id,
            "section_id": sample_section.id,
            "skill": "listening",
            "answers": {},
        }
        resp = client.post("/api/user-attempts/submit-mcq", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["score"] == 0

    def test_submit_mcq_returns_results_list(
        self, client, auth_headers,
        sample_user, sample_section,
        sample_listening_question, sample_question_base,
    ):
        payload = {
            "user_id": sample_user.id,
            "section_id": sample_section.id,
            "skill": "listening",
            "answers": {str(sample_listening_question.id): "A"},
        }
        resp = client.post("/api/user-attempts/submit-mcq", json=payload, headers=auth_headers)
        results = resp.json()["results"]
        assert isinstance(results, list)
        assert len(results) == 1
        assert results[0]["question_id"] == sample_listening_question.id
        assert results[0]["user_ans"] == "A"
        assert results[0]["is_correct"] is True

    def test_submit_mcq_reading_skill(
        self, client, auth_headers, db,
        sample_user, sample_section, sample_reading_question,
    ):
        from models.question_base import QuestionBase
        qb = QuestionBase(
            section_id=sample_section.id,
            reading_question_id=sample_reading_question.id,
            skill="reading",
        )
        db.add(qb)
        db.commit()

        payload = {
            "user_id": sample_user.id,
            "section_id": sample_section.id,
            "skill": "reading",
            "answers": {str(sample_reading_question.id): "A"},
        }
        resp = client.post("/api/user-attempts/submit-mcq", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["score"] == 1


# ---------------------------------------------------------------------------
# GET /api/user-attempts/user/{user_id}/history
# ---------------------------------------------------------------------------

class TestGetHistory:
    def test_history_returns_list(self, client, auth_headers, sample_attempt):
        resp = client.get(
            f"/api/user-attempts/user/{sample_attempt.user_id}/history",
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_history_contains_session_info(self, client, auth_headers, sample_attempt):
        resp = client.get(
            f"/api/user-attempts/user/{sample_attempt.user_id}/history",
            headers=auth_headers,
        )
        session = resp.json()[0]
        for key in ("section_id", "section_name", "skill", "attempted_at", "score", "total", "percent"):
            assert key in session

    def test_history_empty_user_returns_empty_list(self, client, auth_headers):
        resp = client.get("/api/user-attempts/user/99999/history", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_history_ordered_desc_by_time(self, client, auth_headers, db,
                                           sample_user, sample_section, sample_question_base):
        from models.user_attempt import UserAttempt
        t1 = datetime(2024, 1, 1, 8, 0, 0)
        t2 = datetime(2024, 3, 1, 8, 0, 0)
        for ts in [t1, t2]:
            db.add(UserAttempt(
                user_id=sample_user.id,
                section_id=sample_section.id,
                question_id=sample_question_base.id,
                user_ans="A",
                is_correct=True,
                created_at=ts,
            ))
        db.commit()
        resp = client.get(
            f"/api/user-attempts/user/{sample_user.id}/history",
            headers=auth_headers,
        )
        sessions = resp.json()
        assert sessions[0]["attempted_at"] >= sessions[-1]["attempted_at"]


# ---------------------------------------------------------------------------
# GET /api/user-attempts/user/{user_id}/session-detail
# ---------------------------------------------------------------------------

class TestGetSessionDetail:
    def test_session_detail_returns_list(self, client, auth_headers, sample_attempt):
        ts = sample_attempt.created_at.isoformat()
        resp = client.get(
            f"/api/user-attempts/user/{sample_attempt.user_id}/session-detail",
            params={"section_id": sample_attempt.section_id, "attempted_at": ts},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_session_detail_contains_answer_info(self, client, auth_headers, sample_attempt):
        ts = sample_attempt.created_at.isoformat()
        resp = client.get(
            f"/api/user-attempts/user/{sample_attempt.user_id}/session-detail",
            params={"section_id": sample_attempt.section_id, "attempted_at": ts},
            headers=auth_headers,
        )
        item = resp.json()[0]
        assert "user_ans" in item
        assert "is_correct" in item
        assert "correct_answer" in item

    def test_session_detail_invalid_timestamp_returns_400(self, client, auth_headers, sample_user):
        resp = client.get(
            f"/api/user-attempts/user/{sample_user.id}/session-detail",
            params={"section_id": 1, "attempted_at": "not-a-date"},
            headers=auth_headers,
        )
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# GET /api/user-attempts/user/{user_id}/weak-areas
# ---------------------------------------------------------------------------

class TestGetWeakAreas:
    def test_weak_areas_returns_expected_structure(self, client, auth_headers, sample_user):
        resp = client.get(
            f"/api/user-attempts/user/{sample_user.id}/weak-areas",
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "weak_areas" in data
        assert "skill_accuracy" in data
        assert "total_mcq_attempts" in data

    def test_weak_areas_no_attempts(self, client, auth_headers, sample_user):
        resp = client.get(
            f"/api/user-attempts/user/{sample_user.id}/weak-areas",
            headers=auth_headers,
        )
        assert resp.json()["total_mcq_attempts"] == 0


# ---------------------------------------------------------------------------
# PUT /api/user-attempts/{attempt_id}
# ---------------------------------------------------------------------------

class TestUpdateAttemptRoute:
    def test_update_user_ans(self, client, auth_headers, sample_attempt):
        resp = client.put(
            f"/api/user-attempts/{sample_attempt.id}",
            json={"user_ans": "C"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["user_ans"] == "C"

    def test_update_nonexistent_returns_404(self, client, auth_headers):
        resp = client.put(
            "/api/user-attempts/99999",
            json={"user_ans": "B"},
            headers=auth_headers,
        )
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# DELETE /api/user-attempts/{attempt_id}
# ---------------------------------------------------------------------------

class TestDeleteAttemptRoute:
    def test_delete_returns_204(self, client, auth_headers, sample_attempt):
        resp = client.delete(
            f"/api/user-attempts/{sample_attempt.id}",
            headers=auth_headers,
        )
        assert resp.status_code == 204

    def test_delete_nonexistent_returns_404(self, client, auth_headers):
        resp = client.delete("/api/user-attempts/99999", headers=auth_headers)
        assert resp.status_code == 404
