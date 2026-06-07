"""Integration tests cho /api/sections/* — yêu cầu JWT."""


class TestCreateSection:
    def test_create_section_returns_200(self, client, auth_headers):
        resp = client.post("/api/sections/create", json={
            "skill": "listening", "name": "Test Section", "time_limit": 30
        }, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["skill"] == "listening"
        assert data["name"] == "Test Section"
        assert data["time_limit"] == 30
        assert "id" in data

    def test_create_section_reading_skill(self, client, auth_headers):
        resp = client.post("/api/sections/create", json={
            "skill": "reading", "name": "Reading Test", "time_limit": 60
        }, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["skill"] == "reading"

    def test_create_section_unauthorized(self, client):
        resp = client.post("/api/sections/create", json={
            "skill": "listening", "name": "X", "time_limit": 30
        })
        assert resp.status_code == 401


class TestGetSections:
    def test_get_all_sections_returns_list(self, client, auth_headers, sample_section):
        resp = client.get("/api/sections/", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
        assert len(resp.json()) >= 1

    def test_get_sections_empty(self, client, auth_headers):
        resp = client.get("/api/sections/", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_get_sections_by_skill_filters(self, client, auth_headers, sample_section, reading_section):
        resp = client.get("/api/sections/?skill=listening", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert all(s["skill"] == "listening" for s in data)

    def test_get_sections_by_skill_no_match_returns_empty(self, client, auth_headers, sample_section):
        resp = client.get("/api/sections/?skill=writing", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_sections_have_attempt_count(self, client, auth_headers, sample_section):
        resp = client.get("/api/sections/", headers=auth_headers)
        section = next(s for s in resp.json() if s["id"] == sample_section.id)
        assert "attempt_count" in section


class TestUpdateSection:
    def test_update_section_name(self, client, auth_headers, sample_section):
        resp = client.put(
            f"/api/sections/{sample_section.id}",
            json={"name": "Updated Name"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Name"

    def test_update_section_time_limit(self, client, auth_headers, sample_section):
        resp = client.put(
            f"/api/sections/{sample_section.id}",
            json={"time_limit": 45},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["time_limit"] == 45

    def test_update_nonexistent_section_returns_404(self, client, auth_headers):
        resp = client.put(
            "/api/sections/99999",
            json={"name": "X"},
            headers=auth_headers,
        )
        assert resp.status_code == 404


class TestDeleteSection:
    def test_delete_section_returns_message(self, client, auth_headers, sample_section):
        resp = client.delete(f"/api/sections/{sample_section.id}", headers=auth_headers)
        assert resp.status_code == 200
        assert "deleted" in resp.json()["message"].lower()

    def test_delete_nonexistent_section_returns_not_found_message(self, client, auth_headers):
        resp = client.delete("/api/sections/99999", headers=auth_headers)
        assert resp.status_code == 200
        assert "not found" in resp.json()["message"].lower()
