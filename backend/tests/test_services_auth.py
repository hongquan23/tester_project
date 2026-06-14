"""Unit tests cho services/auth_service.py — gọi trực tiếp service functions."""
import pytest
from fastapi import HTTPException
from schemas.user import UserCreate, UserLogin, ChangePassword
from services import auth_service


def _user_create(email="svc@test.com", password="pass123", name="SvcUser", role="user"):
    return UserCreate(name=name, email=email, password=password, role=role)


class TestRegisterUser:
    def test_register_success_returns_user(self, db):
        user = auth_service.register_user(db, _user_create())
        assert user.email == "svc@test.com"
        assert user.id is not None

    def test_register_hashes_password(self, db):
        user = auth_service.register_user(db, _user_create())
        from core.security import verify_password
        assert verify_password("pass123", user.password_hash)

    def test_register_duplicate_email_raises_400(self, db):
        auth_service.register_user(db, _user_create(email="dup@test.com"))
        with pytest.raises(HTTPException) as exc_info:
            auth_service.register_user(db, _user_create(email="dup@test.com"))
        assert exc_info.value.status_code == 400


class TestLoginUser:
    def test_login_success_returns_token(self, db):
        auth_service.register_user(db, _user_create(email="login@test.com", password="mypass"))
        result = auth_service.login_user(db, UserLogin(email="login@test.com", password="mypass"))
        assert "access_token" in result
        assert result["token_type"] == "bearer"
        assert "role" in result

    def test_login_wrong_password_raises_401(self, db):
        auth_service.register_user(db, _user_create(email="wp@test.com", password="correct"))
        with pytest.raises(HTTPException) as exc_info:
            auth_service.login_user(db, UserLogin(email="wp@test.com", password="wrong"))
        assert exc_info.value.status_code == 401

    def test_login_nonexistent_email_raises_401(self, db):
        with pytest.raises(HTTPException) as exc_info:
            auth_service.login_user(db, UserLogin(email="nobody@test.com", password="x"))
        assert exc_info.value.status_code == 401


class TestChangePassword:
    def _register(self, db, email="cp@test.com", password="oldpass"):
        user = auth_service.register_user(db, _user_create(email=email, password=password))
        return user

    def test_change_password_success(self, db):
        user = self._register(db)
        result = auth_service.change_password(db, user.id, ChangePassword(
            current_password="oldpass", new_password="newpass123"
        ))
        assert "updated" in result["message"].lower()



class TestUpdateName:
    def test_update_name_success(self, db):
        user = auth_service.register_user(db, _user_create(email="un@test.com", name="Old"))
        result = auth_service.update_name(db, user.id, "New Name")
        assert "updated" in result["message"].lower()

    def test_update_name_not_found_raises_404(self, db):
        with pytest.raises(HTTPException) as exc_info:
            auth_service.update_name(db, 99999, "Name")
        assert exc_info.value.status_code == 404
