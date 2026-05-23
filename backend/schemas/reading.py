from pydantic import BaseModel
from typing import Optional


class ReadingQuestionOut(BaseModel):
    id: int
    passage: Optional[str] = None
    question: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_answer: Optional[str] = None

    # TOEIC RC
    part_number: Optional[int] = None
    question_number: Optional[int] = None
    passage_id: Optional[str] = None
    passage_title: Optional[str] = None
    sentence: Optional[str] = None

    class Config:
        from_attributes = True


class ReadingQuestionCreate(BaseModel):
    passage: Optional[str] = None
    question: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_answer: Optional[str] = None

    # TOEIC RC
    part_number: Optional[int] = None
    question_number: Optional[int] = None
    passage_id: Optional[str] = None
    passage_title: Optional[str] = None
    sentence: Optional[str] = None

    class Config:
        from_attributes = True


class ReadingBulkUpload(BaseModel):
    title: str
    time_limit: int
    questions: list[ReadingQuestionCreate]


class ReadingEtsRcUpload(BaseModel):
    title: str
    time_limit: int = 75
