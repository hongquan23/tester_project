from sqlalchemy.orm import Session
from sqlalchemy import inspect, text
from db.session import engine
from db.base import Base

# Import ALL models để Base biết
from models import (
    User,
    UserAttempt,
    Section,
    ListeningQuestion,
    ReadingQuestion,
    WritingQuestion,
    SpeakingQuestion,
    Flashcard,
)


def _migrate_reading_question(eng):
    """Add new TOEIC RC columns to reading_question if they don't exist yet."""
    inspector = inspect(eng)
    existing = {c["name"] for c in inspector.get_columns("reading_question")}
    new_cols = {
        "part_number": "INTEGER",
        "question_number": "INTEGER",
        "passage_id": "VARCHAR(50)",
        "passage_title": "TEXT",
        "sentence": "TEXT",
    }
    with eng.connect() as conn:
        for col, col_type in new_cols.items():
            if col not in existing:
                conn.execute(text(f"ALTER TABLE reading_question ADD COLUMN {col} {col_type}"))
        conn.commit()


def init_db():
    Base.metadata.create_all(bind=engine)
    _migrate_reading_question(engine)


if __name__ == "__main__":
    init_db()
