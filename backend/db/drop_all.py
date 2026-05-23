from db.session import engine
from db.base import Base   # nơi import toàn bộ models

from models import (
    User,
    
    Section,
    ListeningQuestion,
    ReadingQuestion,
    WritingQuestion,
    SpeakingQuestion,
    
)
Base.metadata.drop_all(bind=engine)
print(Base.metadata.tables.keys())

