"""Integration tests cho /api/speaking/* — mock subprocess, whisper, AI scorers."""
import io
from unittest.mock import patch, MagicMock

# Patch targets
_SUBPROCESS = "api.routes.speaking.subprocess.run"
_TRANSCRIBE  = "api.routes.speaking.transcribe_audio"
_SCORE_Q12   = "api.routes.speaking.score_toeic_sp_q1_2"
_SCORE_Q34   = "api.routes.speaking.score_toeic_sp_q3_4"
_SCORE_Q57   = "api.routes.speaking.score_toeic_sp_q5_7"
_SCORE_Q810  = "api.routes.speaking.score_toeic_sp_q8_10"
_SCORE_Q11   = "api.routes.speaking.score_toeic_sp_q11"

FAKE_AUDIO = ("test.webm", io.BytesIO(b"fake audio bytes"), "audio/webm")
FAKE_FEEDBACK = "Overall score: 80\nFeedback: Good work!"


class TestCreateSpeakingQuestion:
    def test_create_without_image_returns_200(self, client, auth_headers, speaking_section):
        resp = client.post("/api/speaking/", data={
            "section_id": str(speaking_section.id),
            "direction": "Read the following text aloud.",
            "part": "1",
        }, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] is not None
        assert data["part"] == 1

    def test_create_with_question_and_sample_answer(self, client, auth_headers, speaking_section):
        resp = client.post("/api/speaking/", data={
            "section_id": str(speaking_section.id),
            "direction": "Describe the picture.",
            "part": "3",
            "question": "What is happening in the picture?",
            "sample_answer": "Two people are meeting in a conference room.",
        }, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["question"] == "What is happening in the picture?"

    def test_create_unauthorized(self, client, speaking_section):
        resp = client.post("/api/speaking/", data={
            "section_id": str(speaking_section.id),
            "direction": "x",
            "part": "1",
        })
        assert resp.status_code == 401


class TestGetSpeakingBySection:
    def test_get_empty_section_returns_list(self, client, auth_headers, speaking_section):
        resp = client.get(f"/api/speaking/section/{speaking_section.id}", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_returns_created_questions(self, client, auth_headers, speaking_section):
        client.post("/api/speaking/", data={
            "section_id": str(speaking_section.id),
            "direction": "Read aloud.", "part": "1",
        }, headers=auth_headers)
        resp = client.get(f"/api/speaking/section/{speaking_section.id}", headers=auth_headers)
        assert len(resp.json()) == 1


class TestSpeakingQ12:
    def test_q1_2_returns_transcript_and_feedback(self, client, auth_headers):
        with patch(_SUBPROCESS), \
             patch(_TRANSCRIBE, return_value="The quick brown fox."), \
             patch(_SCORE_Q12, return_value=FAKE_FEEDBACK):
            resp = client.post("/api/speaking/q1-2", data={
                "reference_text": "The quick brown fox jumps over the lazy dog.",
            }, files={"audio": FAKE_AUDIO}, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["transcript"] == "The quick brown fox."
        assert data["feedback"] == FAKE_FEEDBACK

    def test_q1_2_calls_transcribe_and_scorer(self, client, auth_headers):
        with patch(_SUBPROCESS), \
             patch(_TRANSCRIBE, return_value="transcript text") as mock_tr, \
             patch(_SCORE_Q12, return_value="feedback") as mock_score:
            client.post("/api/speaking/q1-2", data={
                "reference_text": "reference",
            }, files={"audio": FAKE_AUDIO}, headers=auth_headers)
        mock_tr.assert_called_once()
        mock_score.assert_called_once_with("reference", "transcript text")

    def test_q1_2_unauthorized(self, client):
        resp = client.post("/api/speaking/q1-2", data={"reference_text": "x"},
                           files={"audio": FAKE_AUDIO})
        assert resp.status_code == 401


class TestSpeakingQ34:
    def test_q3_4_returns_transcript_and_evaluation(self, client, auth_headers):
        with patch(_SUBPROCESS), \
             patch(_TRANSCRIBE, return_value="A man is at a desk."), \
             patch(_SCORE_Q34, return_value=FAKE_FEEDBACK):
            resp = client.post("/api/speaking/q3-4", data={
                "image_description": "A man is working at a desk.",
            }, files={"audio": FAKE_AUDIO}, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "transcript" in data
        assert "evaluation" in data

    def test_q3_4_calls_scorer_with_correct_args(self, client, auth_headers):
        with patch(_SUBPROCESS), \
             patch(_TRANSCRIBE, return_value="A woman is reading."), \
             patch(_SCORE_Q34, return_value="ok") as mock_score:
            client.post("/api/speaking/q3-4", data={
                "image_description": "A woman reads a book.",
            }, files={"audio": FAKE_AUDIO}, headers=auth_headers)
        mock_score.assert_called_once_with("A woman is reading.", "A woman reads a book.")


class TestSpeakingQ57:
    def test_q5_7_returns_transcript_and_evaluation(self, client, auth_headers):
        with patch(_SUBPROCESS), \
             patch(_TRANSCRIBE, return_value="I enjoy reading books."), \
             patch(_SCORE_Q57, return_value=FAKE_FEEDBACK):
            resp = client.post("/api/speaking/q5-7", data={
                "question": "What do you like to do in your free time?",
            }, files={"audio": FAKE_AUDIO}, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["transcript"] == "I enjoy reading books."

    def test_q5_7_calls_scorer(self, client, auth_headers):
        with patch(_SUBPROCESS), \
             patch(_TRANSCRIBE, return_value="My answer"), \
             patch(_SCORE_Q57, return_value="ok") as mock_score:
            client.post("/api/speaking/q5-7", data={
                "question": "My question?",
            }, files={"audio": FAKE_AUDIO}, headers=auth_headers)
        mock_score.assert_called_once_with("My question?", "My answer")


class TestSpeakingQ810:
    def test_q8_10_returns_transcript_and_evaluation(self, client, auth_headers):
        with patch(_TRANSCRIBE, return_value="It starts at 9am."), \
             patch(_SCORE_Q810, return_value=FAKE_FEEDBACK):
            resp = client.post("/api/speaking/q8-10", data={
                "information": "Event: Annual Meeting\nDate: Monday 9am",
                "question": "What time does the event start?",
            }, files={"audio": ("test.wav", io.BytesIO(b"audio"), "audio/wav")},
                               headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["transcript"] == "It starts at 9am."
        assert data["evaluation"] == FAKE_FEEDBACK

    def test_q8_10_calls_scorer_with_poster_text(self, client, auth_headers):
        with patch(_TRANSCRIBE, return_value="ans"), \
             patch(_SCORE_Q810, return_value="ok") as mock_score:
            client.post("/api/speaking/q8-10", data={
                "information": "Poster info here",
                "question": "Question here",
            }, files={"audio": ("t.wav", io.BytesIO(b"a"), "audio/wav")}, headers=auth_headers)
        mock_score.assert_called_once_with(
            poster_text="Poster info here",
            question="Question here",
            transcript="ans",
        )


class TestSpeakingQ11:
    def test_q11_returns_transcript_and_evaluation(self, client, auth_headers):
        with patch(_TRANSCRIBE, return_value="I strongly agree."), \
             patch(_SCORE_Q11, return_value=FAKE_FEEDBACK):
            resp = client.post("/api/speaking/q11", data={
                "question": "Do you agree that learning English is important?",
            }, files={"audio": ("t.wav", io.BytesIO(b"a"), "audio/wav")},
                               headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["transcript"] == "I strongly agree."

    def test_q11_calls_scorer_with_question(self, client, auth_headers):
        with patch(_TRANSCRIBE, return_value="my opinion"), \
             patch(_SCORE_Q11, return_value="ok") as mock_score:
            client.post("/api/speaking/q11", data={
                "question": "Should companies provide English training?",
            }, files={"audio": ("t.wav", io.BytesIO(b"a"), "audio/wav")}, headers=auth_headers)
        mock_score.assert_called_once_with(
            "Should companies provide English training?", "my opinion"
        )
