"""
Test configuration — dùng SQLite in-memory thay thế PostgreSQL.
Env vars phải được set TRƯỚC khi import bất kỳ module nào của app.
"""
import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only-32c")
os.environ.setdefault("GROQ_API_KEY", "gsk_test")

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from db.base import Base
import models  # đảm bảo tất cả model được đăng ký với Base.metadata
from api.deps import get_db
from core.security import create_access_token

# ---------------------------------------------------------------------------
# Engine SQLite dùng riêng cho tests (không đụng vào test.db của session.py)
# ---------------------------------------------------------------------------
TEST_DATABASE_URL = "sqlite://"  # in-memory

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ---------------------------------------------------------------------------
# Tạo / xóa bảng theo session pytest
# ---------------------------------------------------------------------------
@pytest.fixture(scope="session", autouse=True)
def create_tables():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# ---------------------------------------------------------------------------
# Xóa dữ liệu giữa các test để tránh ô nhiễm
# ---------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def clean_tables(create_tables):
    yield
    with engine.connect() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        conn.commit()


# ---------------------------------------------------------------------------
# DB session fixture
# ---------------------------------------------------------------------------
@pytest.fixture
def db(clean_tables):
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()


# ---------------------------------------------------------------------------
# TestClient với get_db được override sang SQLite
# ---------------------------------------------------------------------------
@pytest.fixture
def client(db):
    # Import app ở đây để tránh side-effect khi set env vars
    from main import app

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# JWT auth header hợp lệ
# ---------------------------------------------------------------------------
@pytest.fixture
def auth_headers():
    token = create_access_token({"sub": "1", "email": "test@test.com"})
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Fixtures dữ liệu mẫu
# ---------------------------------------------------------------------------
@pytest.fixture
def sample_user(db):
    from models.user import User
    user = User(name="Test User", email="test@test.com", password_hash="hashed", role="user")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def sample_section(db):
    from models.section import Section
    section = Section(test_id=1, skill="listening", time_limit=30, name="Listening Test 1")
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


@pytest.fixture
def sample_listening_question(db):
    from models.listening_question import ListeningQuestion
    lq = ListeningQuestion(
        part=1,
        question_number=1,
        question="What does the man say?",
        option_a="He is hungry",
        option_b="He is tired",
        option_c="He is happy",
        option_d="He is late",
        correct_answer="A",
    )
    db.add(lq)
    db.commit()
    db.refresh(lq)
    return lq


@pytest.fixture
def sample_reading_question(db):
    from models.reading_question import ReadingQuestion
    rq = ReadingQuestion(
        question="Which word best completes the sentence?",
        option_a="quickly",
        option_b="slow",
        option_c="quickly",
        option_d="fast",
        correct_answer="A",
    )
    db.add(rq)
    db.commit()
    db.refresh(rq)
    return rq


@pytest.fixture
def sample_question_base(db, sample_section, sample_listening_question):
    from models.question_base import QuestionBase
    qb = QuestionBase(
        section_id=sample_section.id,
        listening_question_id=sample_listening_question.id,
        skill="listening",
    )
    db.add(qb)
    db.commit()
    db.refresh(qb)
    return qb


@pytest.fixture
def reading_section(db):
    from models.section import Section
    section = Section(test_id=1, skill="reading", time_limit=60, name="Reading Test 1")
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


@pytest.fixture
def speaking_section(db):
    from models.section import Section
    section = Section(test_id=1, skill="speaking", time_limit=20, name="Speaking Test 1")
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


@pytest.fixture
def writing_section(db):
    from models.section import Section
    section = Section(test_id=1, skill="writing", time_limit=60, name="Writing Test 1")
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


@pytest.fixture
def sample_attempt(db, sample_user, sample_section, sample_question_base):
    from models.user_attempt import UserAttempt
    from datetime import datetime
    attempt = UserAttempt(
        user_id=sample_user.id,
        section_id=sample_section.id,
        question_id=sample_question_base.id,
        user_ans="A",
        is_correct=True,
        created_at=datetime(2024, 1, 15, 10, 0, 0),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt
