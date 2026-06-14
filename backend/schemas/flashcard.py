from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FlashcardCreate(BaseModel):
    user_id: int
    original_text: str
    translated_text: Optional[str] = None
    explanation: Optional[str] = None
    example: Optional[str] = None
    example_translation: Optional[str] = None
    ipa: Optional[str] = None
    word_type: Optional[str] = None
    text_type: Optional[str] = "word"
    source_type: Optional[str] = None
    source_id: Optional[int] = None


class FlashcardUpdate(BaseModel):
    is_known: Optional[bool] = None
    review_count: Optional[int] = None
    next_review: Optional[datetime] = None


class FlashcardOut(BaseModel):
    id: int
    user_id: int
    original_text: str
    translated_text: Optional[str]
    explanation: Optional[str]
    example: Optional[str]
    example_translation: Optional[str]
    ipa: Optional[str]
    word_type: Optional[str]
    text_type: Optional[str]
    is_known: bool
    review_count: int
    next_review: Optional[datetime]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class TranslateRequest(BaseModel):
    text: str
    user_id: Optional[int] = None
