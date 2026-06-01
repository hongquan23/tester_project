"""Unit tests cho crud/reading.py."""
import pytest
from models.question_base import QuestionBase
from crud import reading as crud


def _rq_data(**kwargs):
    base = dict(
        question="Which word best completes the sentence?",
        option_a="A", option_b="B", option_c="C", option_d="D",
        correct_answer="B",
    )
    base.update(kwargs)
    return base


class TestCreateReadingQuestion:
    def test_create_returns_question_with_id(self, db, reading_section):
        rq = crud.create(db, _rq_data(), section_id=reading_section.id)
        assert rq.id is not None
        assert rq.correct_answer == "B"

    def test_create_also_creates_question_base(self, db, reading_section):
        rq = crud.create(db, _rq_data(), section_id=reading_section.id)
        qb = db.query(QuestionBase).filter(
            QuestionBase.reading_question_id == rq.id
        ).first()
        assert qb is not None
        assert qb.section_id == reading_section.id
        assert qb.skill == "reading"

    def test_create_with_passage(self, db, reading_section):
        rq = crud.create(db, _rq_data(passage="Some passage text."), section_id=reading_section.id)
        assert rq.passage == "Some passage text."

    def test_create_toeic_rc_fields(self, db, reading_section):
        rq = crud.create(
            db,
            _rq_data(part_number=5, question_number=101, sentence="The team ___ the project."),
            section_id=reading_section.id,
        )
        assert rq.part_number == 5
        assert rq.question_number == 101


class TestGetBySection:
    def test_get_by_section_returns_questions(self, db, reading_section):
        crud.create(db, _rq_data(), section_id=reading_section.id)
        crud.create(db, _rq_data(), section_id=reading_section.id)
        result = crud.get_by_section(db, reading_section.id)
        assert len(result) == 2

    def test_get_by_section_empty_returns_empty_list(self, db, reading_section):
        assert crud.get_by_section(db, reading_section.id) == []

    def test_get_by_section_does_not_cross_sections(self, db, reading_section, sample_section):
        crud.create(db, _rq_data(), section_id=sample_section.id)
        result = crud.get_by_section(db, reading_section.id)
        assert result == []


class TestCreateBulk:
    def test_create_bulk_returns_all_created(self, db, reading_section):
        questions = [_rq_data() for _ in range(3)]
        result = crud.create_bulk(db, questions, section_id=reading_section.id)
        assert len(result) == 3

    def test_create_bulk_creates_question_bases(self, db, reading_section):
        crud.create_bulk(db, [_rq_data(), _rq_data()], section_id=reading_section.id)
        qbs = db.query(QuestionBase).filter(
            QuestionBase.section_id == reading_section.id,
            QuestionBase.skill == "reading",
        ).all()
        assert len(qbs) == 2

    def test_create_bulk_empty_list(self, db, reading_section):
        assert crud.create_bulk(db, [], section_id=reading_section.id) == []


class TestDeleteReadingQuestion:
    def test_delete_returns_question(self, db, reading_section):
        rq = crud.create(db, _rq_data(), section_id=reading_section.id)
        deleted = crud.delete(db, rq.id)
        assert deleted.id == rq.id

    def test_delete_removes_question_base(self, db, reading_section):
        rq = crud.create(db, _rq_data(), section_id=reading_section.id)
        crud.delete(db, rq.id)
        qb = db.query(QuestionBase).filter(
            QuestionBase.reading_question_id == rq.id
        ).first()
        assert qb is None

    def test_delete_nonexistent_returns_none(self, db):
        assert crud.delete(db, 99999) is None
