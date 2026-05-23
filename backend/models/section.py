from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db.base import Base

class Section(Base):
    __tablename__ = "section"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer)
    skill = Column(String)
    time_limit = Column(Integer)
    name = Column(String)

    questions = relationship("QuestionBase", back_populates="section")
    user_attempts = relationship("UserAttempt", back_populates="section")

