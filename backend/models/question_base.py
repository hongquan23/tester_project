from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db.base import Base

class QuestionBase(Base):
    __tablename__ = "question_base"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("section.id"))
    speaking_question_id = Column(Integer, ForeignKey("speaking_question.id"), unique=True)
    writing_question_id = Column(Integer, ForeignKey("writing_question.id"), unique=True)
    listening_question_id = Column(Integer, ForeignKey("listening_question.id"), unique=True)
    reading_question_id = Column(Integer, ForeignKey("reading_question.id"), unique=True)
    skill = Column(String)

    section = relationship("Section", back_populates="questions")
    speaking_question = relationship("SpeakingQuestion", back_populates="question_base")
    writing_question = relationship("WritingQuestion", back_populates="question_base")
    listening_question = relationship("ListeningQuestion", back_populates="question_base")
    reading_question = relationship("ReadingQuestion", back_populates="question_base")
    user_attempt = relationship("UserAttempt", back_populates="question", uselist=False)