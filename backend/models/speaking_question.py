
from sqlalchemy import Column, Integer, Text, ForeignKey, String
from sqlalchemy.orm import relationship
from db.base import Base

class SpeakingQuestion(Base):
    __tablename__ = "speaking_question"

    id = Column(Integer, primary_key=True)
    direction = Column(Text)
    information = Column(Text)
    image_url = Column(String(255))
    image_describe = Column(Text)
    question = Column(Text)
    sample_answer = Column(Text)
    part = Column(Integer)

    question_base = relationship("QuestionBase", back_populates="speaking_question", uselist=False)

    
    