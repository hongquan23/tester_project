from pydantic import BaseModel
from typing import Optional

class QuestionBaseSchema(BaseModel):
    id: int
    skill: str

    class Config:
        orm_mode = True
class QuestionCreateSchema(BaseModel):
    speaking_question_id: Optional[int]
    writing_question_id: Optional[int]
    listening_question_id: Optional[int]
    reading_question_id: Optional[int]
    skill: str