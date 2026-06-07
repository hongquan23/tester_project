"""Unit tests cho services/speaking_AI/toeic_scorer.py.
Mock send_message để không gọi Groq API thật.
"""
from unittest.mock import patch

import pytest

MOCK_TARGET = "services.speaking_AI.toeic_scorer.send_message"
MOCK_RETURN = "Overall score (0-100): 85\nFeedback: Good job!"


class TestSpeakingScorers:
    def test_score_q1_2_returns_send_message_result(self):
        from services.speaking_AI.toeic_scorer import score_toeic_sp_q1_2
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            result = score_toeic_sp_q1_2("The quick brown fox.", "The quick brown fox.")
            assert result == MOCK_RETURN
            mock_send.assert_called_once()

    def test_score_q1_2_prompt_contains_reference_text(self):
        from services.speaking_AI.toeic_scorer import score_toeic_sp_q1_2
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            score_toeic_sp_q1_2("My reference text here", "My transcript here")
            prompt = mock_send.call_args[0][0]
            assert "My reference text here" in prompt
            assert "My transcript here" in prompt

    def test_score_q3_4_returns_send_message_result(self):
        from services.speaking_AI.toeic_scorer import score_toeic_sp_q3_4
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            result = score_toeic_sp_q3_4("A man is walking.", "A man walks in the park.")
            assert result == MOCK_RETURN
            mock_send.assert_called_once()

    def test_score_q3_4_prompt_contains_inputs(self):
        from services.speaking_AI.toeic_scorer import score_toeic_sp_q3_4
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            score_toeic_sp_q3_4("A woman is cooking.", "She is making food.")
            prompt = mock_send.call_args[0][0]
            assert "A woman is cooking." in prompt

    def test_score_q5_7_returns_send_message_result(self):
        from services.speaking_AI.toeic_scorer import score_toeic_sp_q5_7
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            result = score_toeic_sp_q5_7("What do you do on weekends?", "I usually play sports.")
            assert result == MOCK_RETURN
            mock_send.assert_called_once()

    def test_score_q5_7_prompt_contains_question_and_answer(self):
        from services.speaking_AI.toeic_scorer import score_toeic_sp_q5_7
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            score_toeic_sp_q5_7("Do you prefer morning or evening?", "I prefer morning.")
            prompt = mock_send.call_args[0][0]
            assert "Do you prefer morning or evening?" in prompt
            assert "I prefer morning." in prompt

    def test_score_q8_10_returns_send_message_result(self):
        from services.speaking_AI.toeic_scorer import score_toeic_sp_q8_10
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            result = score_toeic_sp_q8_10("Poster info", "What time does it start?", "It starts at 9am.")
            assert result == MOCK_RETURN
            mock_send.assert_called_once()

    def test_score_q8_10_prompt_contains_all_inputs(self):
        from services.speaking_AI.toeic_scorer import score_toeic_sp_q8_10
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            score_toeic_sp_q8_10("Event poster text", "Where is it held?", "In the main hall.")
            prompt = mock_send.call_args[0][0]
            assert "Event poster text" in prompt
            assert "Where is it held?" in prompt

    def test_score_q11_returns_send_message_result(self):
        from services.speaking_AI.toeic_scorer import score_toeic_sp_q11
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            result = score_toeic_sp_q11("Do you agree that technology helps education?",
                                        "Yes, I agree because it provides more resources.")
            assert result == MOCK_RETURN
            mock_send.assert_called_once()

    def test_score_q11_prompt_contains_question(self):
        from services.speaking_AI.toeic_scorer import score_toeic_sp_q11
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            score_toeic_sp_q11("Should offices allow pets?", "I think yes because they reduce stress.")
            prompt = mock_send.call_args[0][0]
            assert "Should offices allow pets?" in prompt


class TestWritingScorers:
    def test_score_w_q1_5_returns_send_message_result(self):
        from services.speaking_AI.toeic_scorer import score_toeic_w_q1_5
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            result = score_toeic_w_q1_5("A man is at a desk.", ["desk", "writing"], "The man is writing at the desk.")
            assert result == MOCK_RETURN
            mock_send.assert_called_once()

    def test_score_w_q1_5_prompt_contains_required_words(self):
        from services.speaking_AI.toeic_scorer import score_toeic_w_q1_5
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            score_toeic_w_q1_5("Image desc", ["contract", "signed"], "The contract was signed.")
            prompt = mock_send.call_args[0][0]
            assert "contract" in prompt
            assert "signed" in prompt

    def test_score_w_q6_7_returns_send_message_result(self):
        from services.speaking_AI.toeic_scorer import score_toeic_w_q6_7
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            result = score_toeic_w_q6_7("Email prompt", "Dear Sir, ...", "Be formal.")
            assert result == MOCK_RETURN
            mock_send.assert_called_once()

    def test_score_w_q6_7_prompt_contains_inputs(self):
        from services.speaking_AI.toeic_scorer import score_toeic_w_q6_7
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            score_toeic_w_q6_7("Confirm a meeting", "Dear Manager, I confirm.", "Use formal tone.")
            prompt = mock_send.call_args[0][0]
            assert "Confirm a meeting" in prompt

    def test_score_w_q8_returns_send_message_result(self):
        from services.speaking_AI.toeic_scorer import score_toeic_w_q8
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            result = score_toeic_w_q8("Should companies allow remote work?",
                                      "Yes, remote work increases productivity.")
            assert result == MOCK_RETURN
            mock_send.assert_called_once()

    def test_score_w_q8_prompt_contains_question_and_response(self):
        from services.speaking_AI.toeic_scorer import score_toeic_w_q8
        with patch(MOCK_TARGET, return_value=MOCK_RETURN) as mock_send:
            score_toeic_w_q8("Do you prefer working alone?", "I prefer working in teams.")
            prompt = mock_send.call_args[0][0]
            assert "Do you prefer working alone?" in prompt
            assert "I prefer working in teams." in prompt
