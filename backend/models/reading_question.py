from sqlalchemy import Column, Integer, Text, String, ForeignKey
from sqlalchemy.orm import relationship
from db.base import Base

class ReadingQuestion(Base):
    __tablename__ = "reading_question"

    id = Column(Integer, primary_key=True)
    passage = Column(Text)
    question = Column(Text)

    option_a = Column(Text)
    option_b = Column(Text)
    option_c = Column(Text)
    option_d = Column(Text)

    correct_answer = Column(String(1))

    # TOEIC RC fields (Part 5/6/7)
    part_number   = Column(Integer, nullable=True)   # 5, 6, or 7
    question_number = Column(Integer, nullable=True)  # 101–200
    passage_id    = Column(String(50), nullable=True)  # groups questions by passage
    passage_title = Column(Text, nullable=True)
    sentence      = Column(Text, nullable=True)       # Part 5 incomplete sentence

    question_base = relationship("QuestionBase", back_populates="reading_question", uselist=False)
