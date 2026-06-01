"""Unit tests cho crud/listening.py."""
import pytest
from models.question_base import QuestionBase
from crud import listening as crud


def _lq_data(**kwargs):
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
    def test_create_returns_question_with_id(self, db, sample_section):
        lq = crud.create(db, _lq_data(), section_id=sample_section.id)
        assert lq.id is not None
        assert lq.correct_answer == "A"

    def test_create_also_creates_question_base(self, db, sample_section):
        lq = crud.create(db, _lq_data(), section_id=sample_section.id)
        qb = db.query(QuestionBase).filter(
            QuestionBase.listening_question_id == lq.id
        ).first()
        assert qb is not None
        assert qb.section_id == sample_section.id
        assert qb.skill == "listening"

    def test_create_with_optional_fields(self, db, sample_section):
        lq = crud.create(db, _lq_data(passage="Transcript text", audio_url="audio/test.mp3"),
                         section_id=sample_section.id)
        assert lq.passage == "Transcript text"
        assert lq.audio_url == "audio/test.mp3"


class TestGetBySection:
    def test_get_by_section_returns_questions(self, db, sample_section):
        crud.create(db, _lq_data(question_number=1), section_id=sample_section.id)
        crud.create(db, _lq_data(question_number=2), section_id=sample_section.id)
        result = crud.get_by_section(db, sample_section.id)
        assert len(result) == 2

    def test_get_by_section_ordered_by_question_number(self, db, sample_section):
        crud.create(db, _lq_data(question_number=3), section_id=sample_section.id)
        crud.create(db, _lq_data(question_number=1), section_id=sample_section.id)
        result = crud.get_by_section(db, sample_section.id)
        nums = [q.question_number for q in result]
        assert nums == sorted(nums)

    def test_get_by_section_empty_returns_empty_list(self, db, sample_section):
        assert crud.get_by_section(db, sample_section.id) == []

    def test_get_by_section_does_not_return_other_section_questions(self, db, sample_section, reading_section):
        crud.create(db, _lq_data(), section_id=reading_section.id)
        result = crud.get_by_section(db, sample_section.id)
        assert result == []


class TestCreateBulk:
    def test_create_bulk_returns_all_created(self, db, sample_section):
        questions = [_lq_data(question_number=i) for i in range(1, 4)]
        result = crud.create_bulk(db, questions, section_id=sample_section.id)
        assert len(result) == 3

    def test_create_bulk_creates_question_bases(self, db, sample_section):
        crud.create_bulk(db, [_lq_data(question_number=i) for i in range(1, 3)],
                         section_id=sample_section.id)
        qbs = db.query(QuestionBase).filter(
            QuestionBase.section_id == sample_section.id,
            QuestionBase.skill == "listening",
        ).all()
        assert len(qbs) == 2

    def test_create_bulk_empty_list_returns_empty(self, db, sample_section):
        result = crud.create_bulk(db, [], section_id=sample_section.id)
        assert result == []


class TestDeleteListeningQuestion:
    def test_delete_returns_question(self, db, sample_section):
        lq = crud.create(db, _lq_data(), section_id=sample_section.id)
        deleted = crud.delete(db, lq.id)
        assert deleted.id == lq.id

    def test_delete_removes_question_base(self, db, sample_section):
        lq = crud.create(db, _lq_data(), section_id=sample_section.id)
        crud.delete(db, lq.id)
        qb = db.query(QuestionBase).filter(
            QuestionBase.listening_question_id == lq.id
        ).first()
        assert qb is None

    def test_delete_nonexistent_returns_none(self, db):
        assert crud.delete(db, 99999) is None
