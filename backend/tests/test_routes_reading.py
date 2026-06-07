"""Integration tests cho /api/reading/* — yêu cầu JWT."""


def _rq_payload(**kwargs):
    base = dict(
        question="Which word best completes the sentence?",
        option_a="A", option_b="B", option_c="C", option_d="D",
        correct_answer="B",
    )
    base.update(kwargs)
    return base


class TestCreateReadingQuestion:
    def test_create_returns_200_with_id(self, client, auth_headers, reading_section):
        resp = client.post(
            f"/api/reading/section/{reading_section.id}",
            json=_rq_payload(),
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["id"] is not None
        assert resp.json()["correct_answer"] == "B"

    def test_create_with_passage(self, client, auth_headers, reading_section):
        resp = client.post(
            f"/api/reading/section/{reading_section.id}",
            json=_rq_payload(passage="The company announced..."),
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["passage"] == "The company announced..."

    def test_create_unauthorized(self, client, reading_section):
        resp = client.post(f"/api/reading/section/{reading_section.id}", json=_rq_payload())
        assert resp.status_code == 401


class TestGetReadingBySection:
    def test_get_returns_list(self, client, auth_headers, reading_section):
        client.post(f"/api/reading/section/{reading_section.id}", json=_rq_payload(), headers=auth_headers)
        resp = client.get(f"/api/reading/section/{reading_section.id}", headers=auth_headers)
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    def test_get_empty_returns_empty_list(self, client, auth_headers, reading_section):
        resp = client.get(f"/api/reading/section/{reading_section.id}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []


class TestUploadReadingJson:
    def test_upload_json_creates_section_and_questions(self, client, auth_headers):
        payload = {
            "title": "Reading Test",
            "time_limit": 60,
            "questions": [_rq_payload(), _rq_payload()],
        }
        resp = client.post("/api/reading/upload-json", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] == 2
        assert "section_id" in data


class TestUploadEtsRcJson:
    def test_upload_part5(self, client, auth_headers):
        payload = {
            "title": "TOEIC RC Part 5",
            "time_limit": 30,
            "parts": [{
                "part_number": 5,
                "questions": [{
                    "question_number": 101,
                    "sentence": "The manager ___ the report.",
                    "options": {"A": "approved", "B": "approving", "C": "approve", "D": "approval"},
                    "correct_answer": "A",
                }],
            }],
        }
        resp = client.post("/api/reading/upload-ets-rc-json", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["count"] == 1

    def test_upload_part7(self, client, auth_headers):
        payload = {
            "title": "TOEIC RC Part 7",
            "time_limit": 55,
            "parts": [{
                "part_number": 7,
                "passages": [{
                    "passage_id": "P1",
                    "passage_title": "Memo",
                    "passage_text": "The meeting is scheduled for Monday.",
                    "questions": [{
                        "question_number": 153,
                        "question": "When is the meeting?",
                        "options": {"A": "Monday", "B": "Tuesday", "C": "Friday", "D": "Sunday"},
                        "correct_answer": "A",
                    }],
                }],
            }],
        }
        resp = client.post("/api/reading/upload-ets-rc-json", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["count"] == 1

    def test_upload_empty_parts(self, client, auth_headers):
        payload = {"title": "Empty RC", "parts": []}
        resp = client.post("/api/reading/upload-ets-rc-json", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["count"] == 0


class TestDeleteReadingQuestion:
    def test_delete_existing_question(self, client, auth_headers, reading_section):
        create_resp = client.post(
            f"/api/reading/section/{reading_section.id}",
            json=_rq_payload(),
            headers=auth_headers,
        )
        q_id = create_resp.json()["id"]
        resp = client.delete(f"/api/reading/{q_id}", headers=auth_headers)
        assert resp.status_code == 200
        assert "deleted" in resp.json()["message"].lower()

    def test_delete_nonexistent_returns_404(self, client, auth_headers):
        resp = client.delete("/api/reading/99999", headers=auth_headers)
        assert resp.status_code == 404
