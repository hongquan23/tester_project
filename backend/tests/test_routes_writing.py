"""Integration tests cho /api/writing/* — yêu cầu JWT.
AI-scoring endpoints (q1_5, q6_7, q8) được mock để tránh phụ thuộc Groq API.
"""
from unittest.mock import patch


class TestGetWritingBySection:
    def test_get_empty_section(self, client, auth_headers, writing_section):
        resp = client.get(f"/api/writing/section/{writing_section.id}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_get_unauthorized(self, client, writing_section):
        resp = client.get(f"/api/writing/section/{writing_section.id}")
        assert resp.status_code == 401


class TestWritingQ15:
    def test_q1_5_returns_feedback(self, client, auth_headers):
        with patch("api.routes.writing.score_toeic_w_q1_5", return_value="Well done!"):
            resp = client.post("/api/writing/q1_5", data={
                "image_description": "A man is writing at a desk.",
                "required_word_1": "desk",
                "required_word_2": "writing",
                "student_sentence": "The man is writing at the desk.",
            }, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["feedback"] == "Well done!"

    def test_q1_5_unauthorized(self, client):
        resp = client.post("/api/writing/q1_5", data={
            "image_description": "x", "required_word_1": "a",
            "required_word_2": "b", "student_sentence": "c",
        })
        assert resp.status_code == 401


class TestWritingQ67:
    def test_q6_7_returns_feedback(self, client, auth_headers):
        with patch("api.routes.writing.score_toeic_w_q6_7", return_value="Good email!"):
            resp = client.post("/api/writing/q6_7", data={
                "email_prompt": "Write an email to confirm the meeting.",
                "directions": "Use formal language.",
                "student_response": "Dear Sir, I confirm the meeting on Monday.",
            }, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["feedback"] == "Good email!"


class TestWritingQ8:
    def test_q8_returns_feedback(self, client, auth_headers):
        with patch("api.routes.writing.score_toeic_w_q8", return_value="Excellent opinion!"):
            resp = client.post("/api/writing/q8", data={
                "question": "Do you agree that remote work increases productivity?",
                "student_response": "I agree because employees save commute time.",
            }, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["feedback"] == "Excellent opinion!"

    def test_q8_unauthorized(self, client):
        resp = client.post("/api/writing/q8", data={
            "question": "q", "student_response": "r",
        })
        assert resp.status_code == 401
