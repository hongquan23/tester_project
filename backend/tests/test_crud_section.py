"""Unit tests cho crud/section.py."""
import pytest
from models.section import Section
from models.user_attempt import UserAttempt
from schemas.section import SectionCreate
from crud import section as crud


def _make_section_create(skill="listening", name="Test", time_limit=30):
    return SectionCreate(skill=skill, name=name, time_limit=time_limit)


class TestCreateSection:
    def test_create_returns_section_with_id(self, db):
        s = crud.create(db, _make_section_create())
        assert s.id is not None
        assert s.skill == "listening"
        assert s.name == "Test"

    def test_create_sets_attempt_count_zero(self, db):
        s = crud.create(db, _make_section_create())
        assert s.attempt_count == 0

    def test_create_multiple_sections(self, db):
        s1 = crud.create(db, _make_section_create(name="A"))
        s2 = crud.create(db, _make_section_create(name="B"))
        assert s1.id != s2.id


class TestGetSection:
    def test_get_all_returns_list(self, db):
        crud.create(db, _make_section_create(name="S1"))
        crud.create(db, _make_section_create(name="S2"))
        sections = crud.get_all(db)
        assert len(sections) == 2

    def test_get_all_empty(self, db):
        assert crud.get_all(db) == []

    def test_get_by_id_returns_section(self, db):
        s = crud.create(db, _make_section_create())
        found = crud.get_by_id(db, s.id)
        assert found is not None
        assert found.id == s.id

    def test_get_by_id_not_found_returns_none(self, db):
        assert crud.get_by_id(db, 99999) is None

    def test_get_by_skill_filters_correctly(self, db):
        crud.create(db, _make_section_create(skill="listening", name="L1"))
        crud.create(db, _make_section_create(skill="reading", name="R1"))
        crud.create(db, _make_section_create(skill="reading", name="R2"))
        result = crud.get_by_skill(db, "reading")
        assert len(result) == 2
        assert all(s.skill == "reading" for s in result)

    def test_get_by_skill_no_match_returns_empty(self, db):
        crud.create(db, _make_section_create(skill="listening"))
        assert crud.get_by_skill(db, "speaking") == []


class TestDeleteSection:
    def test_delete_existing_section(self, db):
        s = crud.create(db, _make_section_create())
        result = crud.delete(db, s.id)
        assert result["message"] == "Section deleted successfully"
        assert crud.get_by_id(db, s.id) is None

    def test_delete_nonexistent_section(self, db):
        result = crud.delete(db, 99999)
        assert result["message"] == "Section not found"


class TestAttemptCount:
    def test_get_by_id_includes_attempt_count(self, db, sample_user, sample_section, sample_question_base):
        attempt = UserAttempt(
            user_id=sample_user.id,
            section_id=sample_section.id,
            question_id=sample_question_base.id,
            user_ans="A",
            is_correct=True,
        )
        db.add(attempt)
        db.commit()
        section = crud.get_by_id(db, sample_section.id)
        assert section.attempt_count >= 1

    def test_get_all_includes_attempt_count(self, db, sample_user, sample_section, sample_question_base):
        db.add(UserAttempt(
            user_id=sample_user.id,
            section_id=sample_section.id,
            question_id=sample_question_base.id,
            user_ans="A",
            is_correct=True,
        ))
        db.commit()
        sections = crud.get_all(db)
        target = next(s for s in sections if s.id == sample_section.id)
        assert target.attempt_count >= 1

    def test_sections_without_attempts_have_zero_count(self, db):
        s = crud.create(db, _make_section_create())
        sections = crud.get_all(db)
        target = next(sec for sec in sections if sec.id == s.id)
        assert target.attempt_count == 0
