from sqlalchemy import Column, Integer, String, Time
from db.base import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String)
    created_at = Column(Time)

    user_attempts = relationship("UserAttempt", back_populates="user")
