from sqlalchemy import Column, Integer, Text, String
from sqlalchemy.orm import relationship
from db.base import Base


class ListeningQuestion(Base):
    __tablename__ = "listening_question"

    id = Column(Integer, primary_key=True)
    part = Column(Integer)
    question_number = Column(Integer)
    directions = Column(Text)
    passage = Column(Text)
    question = Column(Text)
    graphic_url = Column(String(255))   # ảnh minh họa bảng/sơ đồ
    audio_url = Column(String(255))
    image_url = Column(String(255))

    option_a = Column(Text)
    option_b = Column(Text)
    option_c = Column(Text)
    option_d = Column(Text)

    correct_answer = Column(String(1))

    question_base = relationship("QuestionBase", back_populates="listening_question", uselist=False)
