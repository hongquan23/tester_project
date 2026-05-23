import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.deps import get_db
from models.section import Section
from schemas.listening import (
    ListeningQuestionCreate,
    ListeningQuestionOut,
    ListeningBulkUpload,
    ListeningEtsUpload,
    EtsPart,
)
from crud import listening as listening_crud

router = APIRouter()


def _normalize_audio_url(raw: str | None) -> str | None:
    """Chuyển full path Windows/POSIX thành relative URL: audio/file.mp3"""
    if not raw:
        return None
    match = re.search(r'audio[/\\](.+)$', raw, re.IGNORECASE)
    if match:
        return f"audio/{match.group(1).replace(chr(92), '/')}"
    return f"audio/{raw.replace(chr(92), '/').split('/')[-1]}"


def _normalize_image_url(raw: str | None) -> str | None:
    """Chuyển full path Windows/POSIX thành relative URL: images/sub/file.jpg"""
    if not raw:
        return None
    match = re.search(r'images[/\\](.+)$', raw, re.IGNORECASE)
    if match:
        return f"images/{match.group(1).replace(chr(92), '/')}"
    return f"images/{raw.replace(chr(92), '/').split('/')[-1]}"


def _parse_ets_part(part: EtsPart, audio_url: str | None = None) -> list[dict]:
    rows = []

    # Part 1 (Photographs) & Part 2 (Question-Response)
    if part.questions:
        for q in part.questions:
            rows.append({
                "part": part.part_number,
                "question_number": q.question_number,
                "directions": part.directions,
                "passage": None,
                "question": q.question or "",
                "graphic_url": None,
                "audio_url": audio_url,
                "image_url": _normalize_image_url(q.image_url),
                "option_a": q.options.A,
                "option_b": q.options.B,
                "option_c": q.options.C or "",
                "option_d": q.options.D or None,
                "correct_answer": q.correct_answer,
            })

    # Part 3: Conversations
    if part.conversations:
        for conv in part.conversations:
            for q in conv.questions:
                rows.append({
                    "part": part.part_number,
                    "question_number": q.question_number,
                    "directions": part.directions,
                    "passage": conv.transcript,
                    "question": q.question or "",
                    "graphic_url": None,
                    "audio_url": audio_url,
                    "image_url": None,
                    "option_a": q.options.A,
                    "option_b": q.options.B,
                    "option_c": q.options.C or "",
                    "option_d": q.options.D or None,
                    "correct_answer": q.correct_answer,
                })

    # Part 4: Talks
    if part.talks:
        for talk in part.talks:
            for q in talk.questions:
                rows.append({
                    "part": part.part_number,
                    "question_number": q.question_number,
                    "directions": part.directions,
                    "passage": talk.transcript,
                    "question": q.question or "",
                    "graphic_url": None,
                    "audio_url": audio_url,
                    "image_url": None,
                    "option_a": q.options.A,
                    "option_b": q.options.B,
                    "option_c": q.options.C or "",
                    "option_d": q.options.D or None,
                    "correct_answer": q.correct_answer,
                })

    return rows


@router.post("/section/{section_id}", response_model=ListeningQuestionOut)
def create_listening_question(
    section_id: int,
    q: ListeningQuestionCreate,
    db: Session = Depends(get_db)
):
    return listening_crud.create(db=db, data=q.dict(), section_id=section_id)


@router.post("/upload-json")
def upload_listening_json(
    data: ListeningBulkUpload,
    db: Session = Depends(get_db)
):
    section = Section(skill="listening", time_limit=data.time_limit, name=data.title)
    db.add(section)
    db.flush()

    questions = listening_crud.create_bulk(
        db=db,
        questions=[q.dict() for q in data.questions],
        section_id=section.id
    )
    return {"section_id": section.id, "count": len(questions), "message": "Upload thành công"}


@router.post("/upload-ets-json")
def upload_listening_ets_json(
    data: ListeningEtsUpload,
    db: Session = Depends(get_db)
):
    section = Section(
        skill="listening",
        time_limit=data.time_limit,
        name=data.title
    )
    db.add(section)
    db.flush()

    raw_audio = data.ets_data.audio_url.url if data.ets_data.audio_url else None
    audio_url = _normalize_audio_url(raw_audio)

    all_questions = []
    for part in data.ets_data.parts:
        all_questions.extend(_parse_ets_part(part, audio_url))

    listening_crud.create_bulk(db=db, questions=all_questions, section_id=section.id)

    return {
        "message": "Upload ETS thành công",
        "section_id": section.id,
        "total_questions": len(all_questions),
        "parts": len(data.ets_data.parts)
    }


@router.get("/section/{section_id}", response_model=list[ListeningQuestionOut])
def get_listening_questions_by_section(
    section_id: int,
    db: Session = Depends(get_db)
):
    return listening_crud.get_by_section(db, section_id)


@router.delete("/{question_id}")
def delete_listening_question(
    question_id: int,
    db: Session = Depends(get_db)
):
    q = listening_crud.delete(db, question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Listening question not found")
    return {"message": "Deleted successfully"}
