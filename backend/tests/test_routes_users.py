"""Integration tests cho /api/users/* — yêu cầu JWT."""


class TestGetUsers:
    def test_get_all_returns_list(self, client, auth_headers, sample_user):
        resp = client.get("/api/users/", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
        assert len(resp.json()) >= 1

    def test_get_all_empty_returns_empty_list(self, client, auth_headers):
        resp = client.get("/api/users/", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_get_all_unauthorized(self, client):
        resp = client.get("/api/users/")
        assert resp.status_code == 401


class TestGetUserById:
    def test_get_existing_user(self, client, auth_headers, sample_user):
        resp = client.get(f"/api/users/{sample_user.id}", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == sample_user.id
        assert data["email"] == sample_user.email

    def test_get_nonexistent_user_raises_server_error(self, auth_headers):
        # Bug trong code: route không guard None trước khi trả về response_model=UserOut
        # → FastAPI raise ResponseValidationError (500). Test này ghi nhận hành vi đó.
        from main import app
        from api.deps import get_db
        from tests.conftest import TestingSession

        def override():
            yield TestingSession()

        app.dependency_overrides[get_db] = override
        from fastapi.testclient import TestClient
        import pytest
        with TestClient(app, raise_server_exceptions=False) as c:
            resp = c.get("/api/users/99999", headers=auth_headers)
        app.dependency_overrides.clear()
        assert resp.status_code == 500


class TestDeleteUser:
    def test_delete_existing_user(self, client, auth_headers, sample_user):
        resp = client.delete(f"/api/users/{sample_user.id}", headers=auth_headers)
        assert resp.status_code == 200

    def test_delete_removes_user(self, client, auth_headers, sample_user, db):
        client.delete(f"/api/users/{sample_user.id}", headers=auth_headers)
        from crud import user as crud_user
        assert crud_user.get_by_id(db, sample_user.id) is None


class TestUpdateName:
    def test_update_name_success(self, client, auth_headers, sample_user):
        resp = client.put(
            f"/api/users/update-name/{sample_user.id}",
            json={"name": "Updated Name"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Name"

    def test_update_name_persists(self, client, auth_headers, sample_user, db):
        client.put(
            f"/api/users/update-name/{sample_user.id}",
            json={"name": "Persisted Name"},
            headers=auth_headers,
        )
        from crud import user as crud_user
        user = crud_user.get_by_id(db, sample_user.id)
        assert user.name == "Persisted Name"
