"""Tests cho /api/chatbot/chat và hàm build_system_prompt."""
from unittest.mock import patch, MagicMock
from datetime import datetime


# ---------------------------------------------------------------------------
# Unit tests cho build_system_prompt (pure Python, không cần mock)
# ---------------------------------------------------------------------------

class TestBuildSystemPrompt:
    def _no_data_ctx(self):
        return {"has_data": False}

    def _weak_data_empty(self):
        return {"weak_areas": [], "skill_accuracy": {}, "total_mcq_attempts": 0}

    def test_prompt_no_data_contains_no_attempt_message(self):
        from api.routes.chatbot import build_system_prompt
        prompt = build_system_prompt(self._no_data_ctx(), self._weak_data_empty())
        assert "chưa có dữ liệu" in prompt

    def test_prompt_with_data_contains_session_count(self):
        from api.routes.chatbot import build_system_prompt
        ctx = {
            "has_data": True,
            "total_sessions": 5,
            "avg_score_pct": 72.5,
            "most_practiced_skill": "listening",
            "skill_session_counts": {"listening": 3, "reading": 2},
            "recent_sessions": [],
            "trend": None,
            "best_session": None,
            "worst_session": None,
        }
        prompt = build_system_prompt(ctx, self._weak_data_empty())
        assert "5 phiên" in prompt
        assert "72.5%" in prompt

    def test_prompt_with_recent_sessions(self):
        from api.routes.chatbot import build_system_prompt
        ctx = {
            "has_data": True,
            "total_sessions": 2,
            "avg_score_pct": 60.0,
            "most_practiced_skill": "reading",
            "skill_session_counts": {"reading": 2},
            "recent_sessions": [
                {"date": "2024-01-15", "section_name": "Reading Test 1",
                 "skill": "reading", "score": 7, "total": 10, "percent": 70},
            ],
            "trend": None,
            "best_session": None,
            "worst_session": None,
        }
        prompt = build_system_prompt(ctx, self._weak_data_empty())
        assert "Reading Test 1" in prompt
        assert "7/10" in prompt

    def test_prompt_with_improving_trend(self):
        from api.routes.chatbot import build_system_prompt
        ctx = {
            "has_data": True,
            "total_sessions": 6,
            "avg_score_pct": 75.0,
            "most_practiced_skill": "listening",
            "skill_session_counts": {"listening": 6},
            "recent_sessions": [],
            "trend": {
                "improving": True,
                "first_avg": 55.0,
                "second_avg": 75.0,
                "delta": 20.0,
            },
            "best_session": None,
            "worst_session": None,
        }
        prompt = build_system_prompt(ctx, self._weak_data_empty())
        assert "Đang cải thiện" in prompt

    def test_prompt_with_declining_trend(self):
        from api.routes.chatbot import build_system_prompt
        ctx = {
            "has_data": True,
            "total_sessions": 6,
            "avg_score_pct": 50.0,
            "most_practiced_skill": "listening",
            "skill_session_counts": {"listening": 6},
            "recent_sessions": [],
            "trend": {
                "improving": False,
                "first_avg": 70.0,
                "second_avg": 50.0,
                "delta": -20.0,
            },
            "best_session": None,
            "worst_session": None,
        }
        prompt = build_system_prompt(ctx, self._weak_data_empty())
        assert "Chưa cải thiện" in prompt

    def test_prompt_with_best_and_worst_session(self):
        from api.routes.chatbot import build_system_prompt
        ctx = {
            "has_data": True,
            "total_sessions": 3,
            "avg_score_pct": 65.0,
            "most_practiced_skill": "listening",
            "skill_session_counts": {"listening": 3},
            "recent_sessions": [],
            "trend": None,
            "best_session": {"section_name": "Best Test", "percent": 90},
            "worst_session": {"section_name": "Worst Test", "percent": 40},
        }
        prompt = build_system_prompt(ctx, self._weak_data_empty())
        assert "Best Test" in prompt
        assert "Worst Test" in prompt

    def test_prompt_with_weak_areas(self):
        from api.routes.chatbot import build_system_prompt
        weak_data = {
            "weak_areas": [
                {"part_label": "Listening Part 1", "accuracy": 0.35,
                 "correct": 7, "total_attempts": 20, "level": "weak"},
            ],
            "skill_accuracy": {
                "listening": {"accuracy": 0.35, "correct": 7, "total": 20},
            },
            "total_mcq_attempts": 20,
        }
        prompt = build_system_prompt(self._no_data_ctx(), weak_data)
        assert "Listening Part 1" in prompt
        assert "20 câu" in prompt

    def test_prompt_is_string(self):
        from api.routes.chatbot import build_system_prompt
        result = build_system_prompt(self._no_data_ctx(), self._weak_data_empty())
        assert isinstance(result, str)
        assert len(result) > 100


# ---------------------------------------------------------------------------
# Integration tests cho POST /api/chatbot/chat
# ---------------------------------------------------------------------------

def _make_chunk(text):
    chunk = MagicMock()
    chunk.choices = [MagicMock()]
    chunk.choices[0].delta.content = text
    return chunk


class TestChatbotRoute:
    def _mock_groq(self, chunks):
        """Context manager: patches Groq() inside the chatbot route."""
        mock_groq_class = MagicMock()
        mock_instance = MagicMock()
        mock_groq_class.return_value = mock_instance
        mock_instance.chat.completions.create.return_value = iter(chunks)
        return patch("groq.Groq", mock_groq_class), mock_groq_class

    def test_chat_without_user_id_returns_200(self, client, auth_headers):
        patch_ctx, _ = self._mock_groq([_make_chunk("Hello!"), _make_chunk(" World")])
        with patch_ctx:
            resp = client.post("/api/chatbot/chat", json={
                "message": "Xin chào"
            }, headers=auth_headers)
        assert resp.status_code == 200

    def test_chat_response_contains_streamed_text(self, client, auth_headers):
        patch_ctx, _ = self._mock_groq([_make_chunk("Bạn đang học tốt"), _make_chunk(" lắm!")])
        with patch_ctx:
            resp = client.post("/api/chatbot/chat", json={
                "message": "Tôi học như thế nào?"
            }, headers=auth_headers)
        assert "Bạn đang học tốt lắm!" in resp.text

    def test_chat_with_user_id_uses_context(self, client, auth_headers, sample_user, sample_attempt):
        patch_ctx, _ = self._mock_groq([_make_chunk("Dựa trên kết quả của bạn...")])
        with patch_ctx:
            resp = client.post("/api/chatbot/chat", json={
                "user_id": sample_user.id,
                "message": "Điểm yếu của tôi là gì?"
            }, headers=auth_headers)
        assert resp.status_code == 200

    def test_chat_with_history(self, client, auth_headers):
        patch_ctx, _ = self._mock_groq([_make_chunk("Câu trả lời")])
        with patch_ctx:
            resp = client.post("/api/chatbot/chat", json={
                "message": "Câu hỏi tiếp theo",
                "history": [
                    {"role": "user", "content": "Câu hỏi đầu"},
                    {"role": "assistant", "content": "Câu trả lời đầu"},
                ],
            }, headers=auth_headers)
        assert resp.status_code == 200

    def test_chat_unauthorized(self, client):
        resp = client.post("/api/chatbot/chat", json={"message": "Hello"})
        assert resp.status_code == 401

    def test_chat_chunk_with_none_content_is_skipped(self, client, auth_headers):
        none_chunk = MagicMock()
        none_chunk.choices = [MagicMock()]
        none_chunk.choices[0].delta.content = None
        patch_ctx, _ = self._mock_groq([none_chunk, _make_chunk("OK")])
        with patch_ctx:
            resp = client.post("/api/chatbot/chat", json={"message": "Hi"}, headers=auth_headers)
        assert resp.status_code == 200
        assert "OK" in resp.text
