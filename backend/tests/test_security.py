"""Unit tests cho core/security.py — password hashing và JWT."""
from datetime import timedelta

import pytest
from jose import jwt

from core.security import hash_password, verify_password, create_access_token
from core.config import settings


class TestPasswordHashing:
    def test_hash_returns_non_empty_string(self):
        hashed = hash_password("mypassword")
        assert isinstance(hashed, str)
        assert len(hashed) > 0

    def test_hash_is_not_plaintext(self):
        hashed = hash_password("mypassword")
        assert hashed != "mypassword"

    def test_same_password_produces_different_hashes(self):
        # argon2 dùng salt ngẫu nhiên
        h1 = hash_password("mypassword")
        h2 = hash_password("mypassword")
        assert h1 != h2

    def test_verify_correct_password(self):
        hashed = hash_password("correct_password")
        assert verify_password("correct_password", hashed) is True

    def test_verify_wrong_password(self):
        hashed = hash_password("correct_password")
        assert verify_password("wrong_password", hashed) is False

    def test_verify_empty_password_fails(self):
        hashed = hash_password("somepassword")
        assert verify_password("", hashed) is False


class TestJWTToken:
    def test_create_token_returns_string(self):
        token = create_access_token({"sub": "1"})
        assert isinstance(token, str)
        assert len(token) > 0

    def test_token_contains_correct_payload(self):
        token = create_access_token({"sub": "42", "email": "user@test.com"})
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["sub"] == "42"
        assert payload["email"] == "user@test.com"

    def test_token_contains_expiry(self):
        token = create_access_token({"sub": "1"})
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert "exp" in payload

    def test_token_with_custom_expiry(self):
        delta = timedelta(minutes=5)
        token = create_access_token({"sub": "1"}, expires_delta=delta)
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert "exp" in payload

    def test_expired_token_raises(self):
        from jose import ExpiredSignatureError
        token = create_access_token({"sub": "1"}, expires_delta=timedelta(seconds=-1))
        with pytest.raises(ExpiredSignatureError):
            jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

    def test_wrong_secret_raises(self):
        from jose import JWTError
        token = create_access_token({"sub": "1"})
        with pytest.raises(JWTError):
            jwt.decode(token, "wrong-secret", algorithms=[settings.ALGORITHM])
