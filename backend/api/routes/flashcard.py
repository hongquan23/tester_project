import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.deps import get_db
from core.config import settings
from crud import flashcard as flashcard_crud
from schemas.flashcard import FlashcardCreate, FlashcardUpdate, FlashcardOut, TranslateRequest

router = APIRouter()


@router.post("/translate")
async def translate_word(request: TranslateRequest):
    """Translate a highlighted word/phrase and return full flashcard data."""
    from groq import Groq

    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""You are an English-Vietnamese dictionary. For the word/phrase: "{request.text}"

Return ONLY a JSON object with these fields (no explanation, no markdown):
{{
  "original_text": "{request.text}",
  "translated_text": "Vietnamese translation",
  "ipa": "IPA pronunciation (e.g. /wɜːrd/)",
  "word_type": "noun|verb|adjective|adverb|phrase|other",
  "explanation": "Short Vietnamese explanation of meaning",
  "example": "One example English sentence using the word",
  "example_translation": "Vietnamese translation of the example sentence"
}}"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400,
        temperature=0.2,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Không thể phân tích kết quả dịch")

    return data


@router.post("/", response_model=FlashcardOut)
def create_flashcard(data: FlashcardCreate, db: Session = Depends(get_db)):
    return flashcard_crud.create(db, data)


@router.get("/user/{user_id}", response_model=list[FlashcardOut])
def get_flashcards(user_id: int, db: Session = Depends(get_db)):
    return flashcard_crud.get_by_user(db, user_id)


@router.get("/user/{user_id}/due", response_model=list[FlashcardOut])
def get_due_flashcards(user_id: int, db: Session = Depends(get_db)):
    """Get flashcards due for review (spaced repetition)."""
    return flashcard_crud.get_due_for_review(db, user_id)


@router.patch("/{card_id}/known", response_model=FlashcardOut)
def mark_known(card_id: int, db: Session = Depends(get_db)):
    card = flashcard_crud.get_by_id(db, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard không tồn tại")
    return flashcard_crud.mark_known(db, card)


@router.patch("/{card_id}/unknown", response_model=FlashcardOut)
def mark_unknown(card_id: int, db: Session = Depends(get_db)):
    card = flashcard_crud.get_by_id(db, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard không tồn tại")
    return flashcard_crud.mark_unknown(db, card)


@router.delete("/{card_id}")
def delete_flashcard(card_id: int, db: Session = Depends(get_db)):
    card = flashcard_crud.get_by_id(db, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard không tồn tại")
    flashcard_crud.delete(db, card)
    return {"message": "Đã xóa flashcard"}
