"""Unit tests cho crud/user.py."""
import pytest
from models.user import User
from schemas.user import UserCreate
from crud import user as crud_user


def _make_user_create(email="u@test.com", name="Test", role="user"):
    return UserCreate(name=name, email=email, password="plain123", role=role)


class TestCreateUser:
    def test_create_returns_user_with_id(self, db):
        user_in = _make_user_create()
        user = crud_user.create(db, user_in, password_hash="hashed_pw")
        assert user.id is not None
        assert user.email == "u@test.com"
        assert user.name == "Test"
        assert user.role == "user"

    def test_created_user_has_hashed_password(self, db):
        user_in = _make_user_create()
        user = crud_user.create(db, user_in, password_hash="hashed_value")
        assert user.password_hash == "hashed_value"

    def test_email_must_be_unique(self, db):
        user_in = _make_user_create(email="dup@test.com")
        crud_user.create(db, user_in, password_hash="hash1")
        with pytest.raises(Exception):
            crud_user.create(db, user_in, password_hash="hash2")


class TestGetUser:
    def test_get_by_id_returns_user(self, db):
        user_in = _make_user_create(email="byid@test.com")
        created = crud_user.create(db, user_in, password_hash="h")
        found = crud_user.get_by_id(db, created.id)
        assert found is not None
        assert found.id == created.id

    def test_get_by_id_not_found_returns_none(self, db):
        assert crud_user.get_by_id(db, 99999) is None

    def test_get_by_email_returns_user(self, db):
        user_in = _make_user_create(email="byemail@test.com")
        crud_user.create(db, user_in, password_hash="h")
        found = crud_user.get_by_email(db, "byemail@test.com")
        assert found is not None
        assert found.email == "byemail@test.com"

    def test_get_by_email_not_found_returns_none(self, db):
        assert crud_user.get_by_email(db, "nobody@test.com") is None

    def test_get_all_returns_list(self, db):
        crud_user.create(db, _make_user_create(email="a@test.com"), password_hash="h")
        crud_user.create(db, _make_user_create(email="b@test.com"), password_hash="h")
        users = crud_user.get_all(db)
        assert len(users) >= 2

    def test_get_all_empty_db(self, db):
        assert crud_user.get_all(db) == []


class TestUpdateUser:
    def test_update_name(self, db):
        user_in = _make_user_create(email="update@test.com", name="Old Name")
        user = crud_user.create(db, user_in, password_hash="h")
        updated = crud_user.update_name(db, user.id, "New Name")
        assert updated.name == "New Name"

    def test_update_name_not_found_returns_none(self, db):
        assert crud_user.update_name(db, 99999, "Name") is None

    def test_update_password(self, db):
        user_in = _make_user_create(email="pw@test.com")
        user = crud_user.create(db, user_in, password_hash="old_hash")
        updated = crud_user.update_password(db, user.id, "new_hash")
        assert updated.password_hash == "new_hash"

    def test_update_password_not_found_returns_none(self, db):
        assert crud_user.update_password(db, 99999, "hash") is None


class TestDeleteUser:
    def test_delete_removes_user(self, db):
        user_in = _make_user_create(email="del@test.com")
        user = crud_user.create(db, user_in, password_hash="h")
        crud_user.delete(db, user.id)
        assert crud_user.get_by_id(db, user.id) is None

    def test_delete_nonexistent_returns_none(self, db):
        result = crud_user.delete(db, 99999)
        assert result is None
