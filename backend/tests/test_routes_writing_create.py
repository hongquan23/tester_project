"""Tests cho POST /api/writing/ (create question với Form data) và reading part 6."""


class TestWritingCreate:
    def test_create_writing_question_minimal_fields(self, client, auth_headers, writing_section):
        resp = client.post("/api/writing/", data={
            "section_id": str(writing_section.id),
            "question": "Write a sentence describing the picture.",
            "part": "1",
        }, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] is not None
        assert data["question"] == "Write a sentence describing the picture."
        assert data["part"] == 1

    def test_create_writing_with_all_optional_fields(self, client, auth_headers, writing_section):
        resp = client.post("/api/writing/", data={
            "section_id": str(writing_section.id),
            "question": "Write an email.",
            "part": "6",
            "passage": "You received an inquiry from a client.",
            "image_describe": "A business meeting scene.",
            "sample_answer": "Dear Sir, I am writing to...",
            "required_word_1": "confirm",
            "required_word_2": "meeting",
        }, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["required_word_1"] == "confirm"
        assert data["required_word_2"] == "meeting"

    def test_create_writing_unauthorized(self, client, writing_section):
        resp = client.post("/api/writing/", data={
            "section_id": str(writing_section.id),
            "question": "Test", "part": "1",
        })
        assert resp.status_code == 401

    def test_create_and_retrieve_from_section(self, client, auth_headers, writing_section):
        client.post("/api/writing/", data={
            "section_id": str(writing_section.id),
            "question": "Describe the image.", "part": "1",
        }, headers=auth_headers)
        resp = client.get(f"/api/writing/section/{writing_section.id}", headers=auth_headers)
        assert len(resp.json()) == 1


class TestReadingPart6And7Extended:
    """Tests cho các nhánh còn thiếu trong upload-ets-rc-json (Part 6, Part 7 double/triple)."""

    def test_upload_part6_text_completion(self, client, auth_headers):
        payload = {
            "title": "TOEIC RC Part 6",
            "parts": [{
                "part_number": 6,
                "passages": [{
                    "passage_id": "P6A",
                    "passage_title": "Company Memo",
                    "passage_text": "All employees are required to attend the meeting.",
                    "questions": [
                        {
                            "question_number": 131,
                            "options": {"A": "required", "B": "requiring",
                                        "C": "require", "D": "requirement"},
                            "correct_answer": "A",
                        },
                        {
                            "question_number": 132,
                            "options": {"A": "on", "B": "at", "C": "in", "D": "for"},
                            "correct_answer": "B",
                        },
                    ],
                }],
            }],
        }
        resp = client.post("/api/reading/upload-ets-rc-json", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["count"] == 2

    def test_upload_part7_double_passage_with_texts(self, client, auth_headers):
        payload = {
            "title": "TOEIC RC Part 7 Double",
            "parts": [{
                "part_number": 7,
                "passages": [{
                    "passage_id": "DP1",
                    "passage_title": "Email + Reply",
                    "texts": [
                        {"source": "Original email", "text": "Dear Mr. Kim, Please confirm attendance."},
                        {"source": "Reply", "text": "Dear Ms. Lee, I confirm my attendance."},
                    ],
                    "questions": [{
                        "question_number": 176,
                        "question": "What is the purpose of the email?",
                        "options": {"A": "To confirm", "B": "To cancel",
                                    "C": "To postpone", "D": "To inquire"},
                        "correct_answer": "A",
                    }],
                }],
            }],
        }
        resp = client.post("/api/reading/upload-ets-rc-json", json=payload, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["count"] == 1
        # Passage should concatenate both texts
