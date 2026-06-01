"""Integration tests cho /api/auth/* — public routes, không cần JWT."""
import pytest
from core.security import hash_password


# Helpers
def _register(client, email="new@test.com", name="New User", password="pass123", role="user"):
    return client.post("/api/auth/register", json={
        "name": name, "email": email, "password": password, "role": role
    })


def _login(client, email="new@test.com", password="pass123"):
    return client.post("/api/auth/login", json={"email": email, "password": password})


class TestRegister:
    def test_register_success_returns_user(self, client):
        resp = _register(client)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "new@test.com"
        assert data["name"] == "New User"
        assert "id" in data

    def test_register_returns_user_data(self, client):
        resp = _register(client)
        data = resp.json()
        # Kiểm tra các trường cơ bản của user được trả về
        assert data["email"] == "new@test.com"
        assert data["name"] == "New User"

    def test_register_duplicate_email_returns_400(self, client):
        _register(client, email="dup@test.com")
        resp = _register(client, email="dup@test.com")
        assert resp.status_code == 400
        assert "already exists" in resp.json()["detail"].lower()

    def test_register_admin_role(self, client):
        resp = _register(client, email="admin@test.com", role="admin")
        assert resp.status_code == 200
        assert resp.json()["role"] == "admin"


class TestLogin:
    def test_login_success_returns_token(self, client):
        _register(client, email="login@test.com", password="mypassword")
        resp = _login(client, email="login@test.com", password="mypassword")
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "role" in data

    def test_login_wrong_password_returns_401(self, client):
        _register(client, email="wp@test.com", password="correct")
        resp = _login(client, email="wp@test.com", password="wrong")
        assert resp.status_code == 401

    def test_login_nonexistent_email_returns_401(self, client):
        resp = _login(client, email="nobody@test.com", password="anything")
        assert resp.status_code == 401

    def test_login_token_is_valid_jwt(self, client):
        from jose import jwt
        from core.config import settings
        _register(client, email="jwt@test.com", password="secret")
        resp = _login(client, email="jwt@test.com", password="secret")
        token = resp.json()["access_token"]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert "sub" in payload


class TestChangePassword:
    def _create_user_and_get_id(self, client, email="cp@test.com", password="oldpass"):
        resp = _register(client, email=email, password=password)
        return resp.json()["id"]

    def test_change_password_success(self, client):
        user_id = self._create_user_and_get_id(client)
        resp = client.put(f"/api/auth/change-password/{user_id}", json={
            "current_password": "oldpass",
            "new_password": "newpass123",
        })
        assert resp.status_code == 200
        assert "updated" in resp.json()["message"].lower()

    def test_change_password_wrong_current_returns_400(self, client):
        user_id = self._create_user_and_get_id(client, email="cpwrong@test.com")
        resp = client.put(f"/api/auth/change-password/{user_id}", json={
            "current_password": "wrong",
            "new_password": "newpass",
        })
        assert resp.status_code == 400

    def test_change_password_user_not_found_returns_404(self, client):
        resp = client.put("/api/auth/change-password/99999", json={
            "current_password": "old",
            "new_password": "new",
        })
        assert resp.status_code == 404

    def test_changed_password_can_login(self, client):
        user_id = self._create_user_and_get_id(client, email="newlogin@test.com", password="old")
        client.put(f"/api/auth/change-password/{user_id}", json={
            "current_password": "old",
            "new_password": "newpass",
        })
        resp = _login(client, email="newlogin@test.com", password="newpass")
        assert resp.status_code == 200
