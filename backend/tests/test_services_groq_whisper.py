"""Unit tests cho groq_service.py và whisper_service.py — mock external clients."""
from unittest.mock import patch, MagicMock


class TestGroqService:
    def test_send_message_returns_content(self):
        from services.speaking_AI.groq_service import send_message

        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = "Mocked response"

        with patch("services.speaking_AI.groq_service.client") as mock_client:
            mock_client.chat.completions.create.return_value = mock_completion
            result = send_message("Hello, test prompt")

        assert result == "Mocked response"

    def test_send_message_calls_create_with_prompt(self):
        from services.speaking_AI.groq_service import send_message

        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = "OK"

        with patch("services.speaking_AI.groq_service.client") as mock_client:
            mock_client.chat.completions.create.return_value = mock_completion
            send_message("My custom prompt")
            call_kwargs = mock_client.chat.completions.create.call_args
            messages = call_kwargs[1]["messages"]

        assert any("My custom prompt" in str(m) for m in messages)

    def test_send_message_uses_correct_model(self):
        from services.speaking_AI.groq_service import send_message, MODEL

        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = "OK"

        with patch("services.speaking_AI.groq_service.client") as mock_client:
            mock_client.chat.completions.create.return_value = mock_completion
            send_message("prompt")
            call_kwargs = mock_client.chat.completions.create.call_args
            assert call_kwargs[1]["model"] == MODEL


class TestWhisperService:
    def test_transcribe_audio_returns_text(self):
        from services.speaking_AI.whisper_service import transcribe_audio

        with patch("services.speaking_AI.whisper_service.model") as mock_model:
            mock_model.transcribe.return_value = {"text": "Hello world"}
            result = transcribe_audio("audio/test.wav")

        assert result == "Hello world"

    def test_transcribe_audio_calls_model_with_path(self):
        from services.speaking_AI.whisper_service import transcribe_audio

        with patch("services.speaking_AI.whisper_service.model") as mock_model:
            mock_model.transcribe.return_value = {"text": "Test"}
            transcribe_audio("audio/sample.wav")
            mock_model.transcribe.assert_called_once_with("audio/sample.wav")

    def test_transcribe_audio_handles_empty_text(self):
        from services.speaking_AI.whisper_service import transcribe_audio

        with patch("services.speaking_AI.whisper_service.model") as mock_model:
            mock_model.transcribe.return_value = {"text": ""}
            result = transcribe_audio("silent.wav")

        assert result == ""
