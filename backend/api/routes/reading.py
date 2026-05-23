from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from api.deps import get_db
from models.section import Section
from schemas.reading import ReadingQuestionCreate, ReadingQuestionOut, ReadingBulkUpload
from crud import reading as reading_crud

router = APIRouter()


@router.post("/section/{section_id}", response_model=ReadingQuestionOut)
def create_reading_question(
    section_id: int,
    q: ReadingQuestionCreate,
    db: Session = Depends(get_db)
):
    return reading_crud.create(db=db, data=q.dict(), section_id=section_id)


@router.post("/upload-json")
def upload_reading_json(data: ReadingBulkUpload, db: Session = Depends(get_db)):
    section = Section(skill="reading", time_limit=data.time_limit, name=data.title)
    db.add(section)
    db.flush()
    questions = reading_crud.create_bulk(
        db=db, questions=[q.dict() for q in data.questions], section_id=section.id
    )
    return {"section_id": section.id, "count": len(questions), "message": "Upload thành công"}


@router.post("/upload-ets-rc-json")
def upload_ets_rc_json(data: dict, db: Session = Depends(get_db)):
    """
    Upload TOEIC RC format JSON with parts 5, 6, 7.
    Expected top-level keys: title (str), time_limit (int, optional), parts (list).
    """
    title = data.get("title", "TOEIC RC Test")
    time_limit = int(data.get("time_limit", 75))
    parts = data.get("parts", [])

    section = Section(skill="reading", time_limit=time_limit, name=title)
    db.add(section)
    db.flush()

    questions_data = []

    for part in parts:
        part_number = part.get("part_number")

        # ── Part 5: Incomplete Sentences ──────────────────────────────────
        if part_number == 5:
            for q in part.get("questions", []):
                opts = q.get("options", {})
                questions_data.append({
                    "part_number": 5,
                    "question_number": q.get("question_number"),
                    "sentence": q.get("sentence"),
                    "passage": None,
                    "question": None,
                    "passage_id": None,
                    "passage_title": None,
                    "option_a": opts.get("A"),
                    "option_b": opts.get("B"),
                    "option_c": opts.get("C"),
                    "option_d": opts.get("D"),
                    "correct_answer": q.get("correct_answer"),
                })

        # ── Part 6: Text Completion ────────────────────────────────────────
        elif part_number == 6:
            for passage in part.get("passages", []):
                pid = passage.get("passage_id", "")
                ptitle = passage.get("passage_title", "")
                ptext = passage.get("passage_text", "")
                for q in passage.get("questions", []):
                    opts = q.get("options", {})
                    questions_data.append({
                        "part_number": 6,
                        "question_number": q.get("question_number"),
                        "passage_id": pid,
                        "passage_title": ptitle,
                        "passage": ptext,
                        "sentence": None,
                        "question": None,
                        "option_a": opts.get("A"),
                        "option_b": opts.get("B"),
                        "option_c": opts.get("C"),
                        "option_d": opts.get("D"),
                        "correct_answer": q.get("correct_answer"),
                    })

        # ── Part 7: Reading Comprehension ─────────────────────────────────
        elif part_number == 7:
            for passage in part.get("passages", []):
                pid = passage.get("passage_id", "")
                ptitle = passage.get("passage_title", "")

                # Single passage or multiple texts (double/triple passages)
                if "passage_text" in passage:
                    ptext = passage["passage_text"]
                elif "texts" in passage:
                    parts_text = []
                    for t in passage["texts"]:
                        src = t.get("source", "")
                        body = t.get("text", "")
                        header = f"[{src}]\n" if src else ""
                        parts_text.append(header + body)
                    ptext = "\n\n---\n\n".join(parts_text)
                else:
                    ptext = ""

                for q in passage.get("questions", []):
                    opts = q.get("options", {})
                    questions_data.append({
                        "part_number": 7,
                        "question_number": q.get("question_number"),
                        "passage_id": pid,
                        "passage_title": ptitle,
                        "passage": ptext,
                        "sentence": None,
                        "question": q.get("question"),
                        "option_a": opts.get("A"),
                        "option_b": opts.get("B"),
                        "option_c": opts.get("C"),
                        "option_d": opts.get("D"),
                        "correct_answer": q.get("correct_answer"),
                    })

    created = reading_crud.create_bulk(db=db, questions=questions_data, section_id=section.id)
    db.commit()
    return {
        "section_id": section.id,
        "count": len(created),
        "message": f"Upload thành công {len(created)} câu hỏi TOEIC RC",
    }


@router.get("/section/{section_id}", response_model=list[ReadingQuestionOut])
def get_reading_questions(section_id: int, db: Session = Depends(get_db)):
    return reading_crud.get_by_section(db, section_id)


@router.delete("/{question_id}")
def delete_reading_question(question_id: int, db: Session = Depends(get_db)):
    q = reading_crud.delete(db, question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Reading question not found")
    return {"message": "Deleted successfully"}
