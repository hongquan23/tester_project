from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base import Base


class UserAttempt(Base):
    __tablename__ = "user_attempt"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("section.id"))
    user_id = Column(Integer, ForeignKey("user.id"))
    question_id = Column(Integer, ForeignKey("question_base.id"))   # bỏ unique để lưu nhiều lần
    user_ans = Column(Text)
    is_correct = Column(Boolean, nullable=True)                     # tự chấm cho MCQ
    ai_ans = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("QuestionBase", back_populates="user_attempt")
    user = relationship("User", back_populates="user_attempts")
    section = relationship("Section", back_populates="user_attempts")
