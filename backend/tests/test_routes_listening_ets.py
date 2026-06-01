"""Tests cho ETS upload endpoints + helper functions trong listening.py."""


class TestNormalizeUrlHelpers:
    """Test các helper _normalize_audio_url và _normalize_image_url trực tiếp."""

    def test_normalize_audio_url_with_audio_prefix(self):
        from api.routes.listening import _normalize_audio_url
        result = _normalize_audio_url("C:/project/audio/Test01.mp3")
        assert result == "audio/Test01.mp3"

    def test_normalize_audio_url_backslash(self):
        from api.routes.listening import _normalize_audio_url
        result = _normalize_audio_url("C:\\project\\audio\\Test01.mp3")
        assert result == "audio/Test01.mp3"

    def test_normalize_audio_url_none_returns_none(self):
        from api.routes.listening import _normalize_audio_url
        assert _normalize_audio_url(None) is None

    def test_normalize_audio_url_bare_filename(self):
        from api.routes.listening import _normalize_audio_url
        result = _normalize_audio_url("Test01.mp3")
        assert result == "audio/Test01.mp3"

    def test_normalize_image_url_with_images_prefix(self):
        from api.routes.listening import _normalize_image_url
        result = _normalize_image_url("C:/project/images/listening/q1.jpg")
        assert result == "images/listening/q1.jpg"

    def test_normalize_image_url_none_returns_none(self):
        from api.routes.listening import _normalize_image_url
        assert _normalize_image_url(None) is None

    def test_normalize_image_url_bare_filename(self):
        from api.routes.listening import _normalize_image_url
        result = _normalize_image_url("photo.jpg")
        assert result == "images/photo.jpg"


class TestParseEtsPart:
    """Test _parse_ets_part với các loại part khác nhau."""

    def _make_question(self, num=1):
        return {
            "question_number": num,
            "question": f"Question {num}",
            "options": {"A": "Opt A", "B": "Opt B", "C": "Opt C"},
            "correct_answer": "A",
            "image_url": None,
        }

    def test_parse_part1_questions(self):
        from api.routes.listening import _normalize_audio_url, _normalize_image_url
        from schemas.listening import EtsPart, EtsQuestion, EtsOptions

        part_data = {
            "part_number": 1,
            "title": "Part 1",
            "directions": "Look at each photo.",
            "questions": [
                {"question_number": 1, "question": "", "options": {"A": "A", "B": "B", "C": "C"},
                 "correct_answer": "A", "image_url": None}
            ],
        }
        from api.routes.listening import _parse_ets_part
        from schemas.listening import EtsPart
        part = EtsPart(**part_data)
        rows = _parse_ets_part(part, audio_url="audio/test.mp3")
        assert len(rows) == 1
        assert rows[0]["part"] == 1
        assert rows[0]["audio_url"] == "audio/test.mp3"
        assert rows[0]["correct_answer"] == "A"

    def test_parse_part3_conversations(self):
        from api.routes.listening import _parse_ets_part
        from schemas.listening import EtsPart

        part_data = {
            "part_number": 3,
            "title": "Part 3",
            "directions": "Listen to conversations.",
            "conversations": [{
                "conversation_id": "C1",
                "question_numbers": [32, 33, 34],
                "transcript": "Man: Hello. Woman: Hi.",
                "questions": [
                    {"question_number": 32, "question": "What does the man say?",
                     "options": {"A": "A", "B": "B", "C": "C"}, "correct_answer": "B"},
                    {"question_number": 33, "question": "What does the woman say?",
                     "options": {"A": "A", "B": "B", "C": "C"}, "correct_answer": "A"},
                ],
            }],
        }
        part = EtsPart(**part_data)
        rows = _parse_ets_part(part, audio_url="audio/p3.mp3")
        assert len(rows) == 2
        assert rows[0]["passage"] == "Man: Hello. Woman: Hi."
        assert rows[0]["part"] == 3

    def test_parse_part4_talks(self):
        from api.routes.listening import _parse_ets_part
        from schemas.listening import EtsPart

        part_data = {
            "part_number": 4,
            "title": "Part 4",
            "directions": "Listen to talks.",
            "talks": [{
                "talk_id": "T1",
                "question_numbers": [71, 72],
                "transcript": "Welcome to the annual meeting.",
                "questions": [
                    {"question_number": 71, "question": "Who is the speaker?",
                     "options": {"A": "A", "B": "B", "C": "C"}, "correct_answer": "C"},
                ],
            }],
        }
        part = EtsPart(**part_data)
        rows = _parse_ets_part(part)
        assert len(rows) == 1
        assert rows[0]["passage"] == "Welcome to the annual meeting."


class TestUploadEtsJson:
    """Test endpoint POST /api/listening/upload-ets-json."""

    def test_upload_ets_json_part1(self, client, auth_headers):
        payload = {
            "title": "TOEIC LC Test",
            "time_limit": 45,
            "ets_data": {
                "audio_url": {"url": "C:/project/audio/LC01.mp3"},
                "parts": [{
                    "part_number": 1,
                    "title": "Part 1",
                    "directions": "Look at each photo.",
                    "questions": [{
                        "question_number": 1,
                        "question": "",
                        "options": {"A": "A", "B": "B", "C": "C"},
                        "correct_answer": "A",
                        "image_url": None,
                    }],
                }],
            },
        }
        resp = client.post("/api/listening/upload-ets-json", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_questions"] == 1
        assert "section_id" in data

    def test_upload_ets_json_normalizes_audio_url(self, client, auth_headers):
        payload = {
            "title": "Test",
            "time_limit": 30,
            "ets_data": {
                "audio_url": {"url": "C:\\recordings\\audio\\Test03.mp3"},
                "parts": [{
                    "part_number": 1,
                    "title": "Part 1",
                    "directions": "Listen.",
                    "questions": [{
                        "question_number": 1, "question": "",
                        "options": {"A": "A", "B": "B", "C": "C"},
                        "correct_answer": "A", "image_url": None,
                    }],
                }],
            },
        }
        resp = client.post("/api/listening/upload-ets-json", json=payload, headers=auth_headers)
        assert resp.status_code == 200

    def test_upload_ets_json_no_audio_url(self, client, auth_headers):
        payload = {
            "title": "Test No Audio",
            "time_limit": 30,
            "ets_data": {
                "parts": [{
                    "part_number": 2,
                    "title": "Part 2",
                    "directions": "Listen.",
                    "questions": [{
                        "question_number": 11, "question": "Where does the woman go?",
                        "options": {"A": "A", "B": "B", "C": "C"},
                        "correct_answer": "B", "image_url": None,
                    }],
                }],
            },
        }
        resp = client.post("/api/listening/upload-ets-json", json=payload, headers=auth_headers)
        assert resp.status_code == 200

    def test_upload_ets_json_part3_conversations(self, client, auth_headers):
        payload = {
            "title": "Part 3 Test",
            "time_limit": 45,
            "ets_data": {
                "parts": [{
                    "part_number": 3,
                    "title": "Part 3",
                    "directions": "Listen to short conversations.",
                    "conversations": [{
                        "conversation_id": "C1",
                        "question_numbers": [32, 33, 34],
                        "transcript": "A: Hi. B: Hello.",
                        "questions": [
                            {"question_number": 32, "question": "What is discussed?",
                             "options": {"A": "Work", "B": "Food", "C": "Travel"},
                             "correct_answer": "A"},
                        ],
                    }],
                }],
            },
        }
        resp = client.post("/api/listening/upload-ets-json", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["total_questions"] == 1
