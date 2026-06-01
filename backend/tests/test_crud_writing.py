"""Unit tests cho crud/writing.py."""
from models.question_base import QuestionBase
from crud import writing as crud


def _wq_data(**kwargs):
    base = dict(
        question="Write a sentence using the words below.",
        passage=None,
        part=1,
        image_url=None,
        image_describe=None,
        sample_answer="Sample answer.",
        required_word_1="contract",
        required_word_2="signed",
    )
    base.update(kwargs)
    return base


class TestCreateWritingQuestion:
    def test_create_returns_question_with_id(self, db, writing_section):
        wq = crud.create(db, _wq_data(), section_id=writing_section.id)
        assert wq.id is not None
        assert wq.question == "Write a sentence using the words below."

    def test_create_also_creates_question_base(self, db, writing_section):
        wq = crud.create(db, _wq_data(), section_id=writing_section.id)
        qb = db.query(QuestionBase).filter(
            QuestionBase.writing_question_id == wq.id
        ).first()
        assert qb is not None
        assert qb.section_id == writing_section.id

    def test_create_stores_required_words(self, db, writing_section):
        wq = crud.create(db, _wq_data(required_word_1="report", required_word_2="submitted"),
                         section_id=writing_section.id)
        assert wq.required_word_1 == "report"
        assert wq.required_word_2 == "submitted"

    def test_create_with_part_number(self, db, writing_section):
        wq = crud.create(db, _wq_data(part=6), section_id=writing_section.id)
        assert wq.part == 6


class TestGetBySectionWriting:
    def test_get_by_section_returns_questions(self, db, writing_section):
        crud.create(db, _wq_data(), section_id=writing_section.id)
        crud.create(db, _wq_data(), section_id=writing_section.id)
        result = crud.get_by_section(db, writing_section.id)
        assert len(result) == 2

    def test_get_by_section_empty_returns_empty_list(self, db, writing_section):
        assert crud.get_by_section(db, writing_section.id) == []

    def test_get_by_section_does_not_cross_sections(self, db, writing_section, reading_section):
        crud.create(db, _wq_data(), section_id=reading_section.id)
        result = crud.get_by_section(db, writing_section.id)
        assert result == []
