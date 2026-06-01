"""Integration tests cho /api/listening/* — yêu cầu JWT."""
import pytest


def _lq_payload(**kwargs):
    base = dict(
        part=1,
        question_number=1,
        question="What does the speaker say?",
        option_a="A", option_b="B", option_c="C", option_d="D",
        correct_answer="A",
    )
    base.update(kwargs)
    return base


class TestCreateListeningQuestion:
    def test_create_returns_200_with_id(self, client, auth_headers, sample_section):
        resp = client.post(
            f"/api/listening/section/{sample_section.id}",
            json=_lq_payload(),
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] is not None
        assert data["correct_answer"] == "A"

    def test_create_with_optional_fields(self, client, auth_headers, sample_section):
        resp = client.post(
            f"/api/listening/section/{sample_section.id}",
            json=_lq_payload(passage="Conversation text", audio_url="audio/test.mp3"),
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["passage"] == "Conversation text"

    def test_create_unauthorized(self, client, sample_section):
        resp = client.post(f"/api/listening/section/{sample_section.id}", json=_lq_payload())
        assert resp.status_code == 401


class TestGetListeningBySection:
    def test_get_returns_list(self, client, auth_headers, sample_section):
        client.post(f"/api/listening/section/{sample_section.id}", json=_lq_payload(), headers=auth_headers)
        resp = client.get(f"/api/listening/section/{sample_section.id}", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
        assert len(resp.json()) == 1

    def test_get_empty_section_returns_empty_list(self, client, auth_headers, sample_section):
        resp = client.get(f"/api/listening/section/{sample_section.id}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_get_multiple_questions_ordered_by_number(self, client, auth_headers, sample_section):
        for num in [3, 1, 2]:
            client.post(
                f"/api/listening/section/{sample_section.id}",
                json=_lq_payload(question_number=num),
                headers=auth_headers,
            )
        resp = client.get(f"/api/listening/section/{sample_section.id}", headers=auth_headers)
        nums = [q["question_number"] for q in resp.json()]
        assert nums == sorted(nums)


class TestUploadListeningJson:
    def test_upload_json_creates_section_and_questions(self, client, auth_headers):
        payload = {
            "title": "TOEIC Listening Test",
            "time_limit": 45,
            "questions": [
                _lq_payload(question_number=1),
                _lq_payload(question_number=2),
            ],
        }
        resp = client.post("/api/listening/upload-json", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] == 2
        assert "section_id" in data

    def test_upload_json_empty_questions(self, client, auth_headers):
        payload = {"title": "Empty Test", "time_limit": 30, "questions": []}
        resp = client.post("/api/listening/upload-json", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["count"] == 0


class TestDeleteListeningQuestion:
    def test_delete_existing_question(self, client, auth_headers, sample_section):
        create_resp = client.post(
            f"/api/listening/section/{sample_section.id}",
            json=_lq_payload(),
            headers=auth_headers,
        )
        q_id = create_resp.json()["id"]
        resp = client.delete(f"/api/listening/{q_id}", headers=auth_headers)
        assert resp.status_code == 200
        assert "deleted" in resp.json()["message"].lower()

    def test_delete_nonexistent_returns_404(self, client, auth_headers):
        resp = client.delete("/api/listening/99999", headers=auth_headers)
        assert resp.status_code == 404

    def test_delete_removes_from_section(self, client, auth_headers, sample_section):
        create_resp = client.post(
            f"/api/listening/section/{sample_section.id}",
            json=_lq_payload(),
            headers=auth_headers,
        )
        q_id = create_resp.json()["id"]
        client.delete(f"/api/listening/{q_id}", headers=auth_headers)
        get_resp = client.get(f"/api/listening/section/{sample_section.id}", headers=auth_headers)
        assert get_resp.json() == []
