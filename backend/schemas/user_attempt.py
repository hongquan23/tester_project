from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserAttemptBase(BaseModel):
    user_id: int
    section_id: int
    question_id: int
    user_ans: Optional[str] = None
    ai_ans: Optional[str] = None


class UserAttemptCreate(UserAttemptBase):
    pass


class UserAttemptUpdate(BaseModel):
    user_ans: Optional[str] = None
    ai_ans: Optional[str] = None


class UserAttemptOut(UserAttemptBase):
    id: int
    is_correct: Optional[bool] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── MCQ bulk submit ──────────────────────────────────────────────────────────

class MCQSubmit(BaseModel):
    user_id: int
    section_id: int
    skill: str                          # "listening" | "reading"
    answers: dict[str, str]             # { "question_id": "A", ... }


class MCQQuestionResult(BaseModel):
    question_id: int                    # listening/reading question id
    user_ans: str
    correct_answer: str | None
    is_correct: bool | None


class MCQSubmitResult(BaseModel):
    score: int
    total: int
    section_id: int
    created_at: datetime
    results: list[MCQQuestionResult]
