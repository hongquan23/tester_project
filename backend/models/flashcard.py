from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from db.base import Base


class Flashcard(Base):
    __tablename__ = "flashcard"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    original_text = Column(Text, nullable=False)
    translated_text = Column(Text)
    explanation = Column(Text)
    example = Column(Text)
    example_translation = Column(Text)
    ipa = Column(String(300))
    word_type = Column(String(50))
    text_type = Column(String(20), default="word")
    source_type = Column(String(50))
    source_id = Column(Integer)
    is_known = Column(Boolean, default=False)
    review_count = Column(Integer, default=0)
    next_review = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
