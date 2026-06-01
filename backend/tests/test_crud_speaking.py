"""Unit tests cho crud/speaking.py."""
from models.question_base import QuestionBase
from crud import speaking as crud


def _sq_data(**kwargs):
    base = dict(
        direction="Read the passage aloud.",
        part=1,
        information=None,
        question=None,
        image_url=None,
        image_describe=None,
        sample_answer="Sample answer here.",
    )
    base.update(kwargs)
    return base


class TestCreateSpeakingQuestion:
    def test_create_returns_question_with_id(self, db, speaking_section):
        sq = crud.create(db, _sq_data(), section_id=speaking_section.id)
        assert sq.id is not None
        assert sq.part == 1

    def test_create_also_creates_question_base(self, db, speaking_section):
        sq = crud.create(db, _sq_data(), section_id=speaking_section.id)
        qb = db.query(QuestionBase).filter(
            QuestionBase.speaking_question_id == sq.id
        ).first()
        assert qb is not None
        assert qb.section_id == speaking_section.id

    def test_create_with_image_url(self, db, speaking_section):
        sq = crud.create(db, _sq_data(image_url="images/speaking/test.jpg"),
                         section_id=speaking_section.id)
        assert sq.image_url == "images/speaking/test.jpg"


class TestGetBySectionSpeaking:
    def test_get_by_section_returns_questions(self, db, speaking_section):
        crud.create(db, _sq_data(part=1), section_id=speaking_section.id)
        crud.create(db, _sq_data(part=2), section_id=speaking_section.id)
        result = crud.get_by_section(db, speaking_section.id)
        assert len(result) == 2

    def test_get_by_section_empty_returns_empty_list(self, db, speaking_section):
        assert crud.get_by_section(db, speaking_section.id) == []

    def test_get_by_section_does_not_cross_sections(self, db, speaking_section, writing_section):
        crud.create(db, _sq_data(), section_id=writing_section.id)
        result = crud.get_by_section(db, speaking_section.id)
        assert result == []
