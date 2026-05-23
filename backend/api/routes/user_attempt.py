from datetime import datetime
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.deps import get_db
from crud import user_attempt as crud
from models.user_attempt import UserAttempt
from models.question_base import QuestionBase
from models.section import Section
from models.listening_question import ListeningQuestion
from models.reading_question import ReadingQuestion
from schemas.user_attempt import (
    UserAttemptCreate,
    UserAttemptUpdate,
    UserAttemptOut,
    MCQSubmit,
    MCQSubmitResult,
    MCQQuestionResult,
)

router = APIRouter()


@router.post("/", response_model=UserAttemptOut)
def create_attempt(data: UserAttemptCreate, db: Session = Depends(get_db)):
    return crud.create(db, data)


@router.post("/submit-mcq", response_model=MCQSubmitResult)
def submit_mcq(data: MCQSubmit, db: Session = Depends(get_db)):
    results = []
    now = datetime.utcnow()
    answered_qb_ids = set()

    # ── Lưu câu đã trả lời ──────────────────────────────────────────────────
    for q_id_str, user_ans in data.answers.items():
        q_id = int(q_id_str)

        if data.skill == "listening":
            qb = db.query(QuestionBase).filter(
                QuestionBase.listening_question_id == q_id
            ).first()
            correct = db.query(ListeningQuestion.correct_answer).filter(
                ListeningQuestion.id == q_id
            ).scalar()
        else:
            qb = db.query(QuestionBase).filter(
                QuestionBase.reading_question_id == q_id
            ).first()
            correct = db.query(ReadingQuestion.correct_answer).filter(
                ReadingQuestion.id == q_id
            ).scalar()

        if not qb:
            continue

        answered_qb_ids.add(qb.id)
        is_correct = (user_ans.upper() == correct.upper()) if correct else None

        attempt = UserAttempt(
            user_id=data.user_id,
            section_id=data.section_id,
            question_id=qb.id,
            user_ans=user_ans,
            is_correct=is_correct,
            created_at=now,
        )
        db.add(attempt)

        results.append(MCQQuestionResult(
            question_id=q_id,
            user_ans=user_ans,
            correct_answer=correct,
            is_correct=is_correct,
        ))

    # ── Lấy toàn bộ câu hỏi trong section ───────────────────────────────────
    if data.skill == "listening":
        all_qbs = db.query(QuestionBase).filter(
            QuestionBase.section_id == data.section_id,
            QuestionBase.listening_question_id.isnot(None),
        ).all()
    else:
        all_qbs = db.query(QuestionBase).filter(
            QuestionBase.section_id == data.section_id,
            QuestionBase.reading_question_id.isnot(None),
        ).all()

    # ── Lưu câu bỏ qua (user_ans=None, is_correct=False) ────────────────────
    for qb in all_qbs:
        if qb.id not in answered_qb_ids:
            attempt = UserAttempt(
                user_id=data.user_id,
                section_id=data.section_id,
                question_id=qb.id,
                user_ans=None,
                is_correct=False,
                created_at=now,
            )
            db.add(attempt)

    db.commit()

    score = sum(1 for r in results if r.is_correct)
    total = len(all_qbs)
    return MCQSubmitResult(
        score=score,
        total=total,
        section_id=data.section_id,
        created_at=now,
        results=results,
    )


@router.get("/user/{user_id}/history")
def get_history(user_id: int, db: Session = Depends(get_db)):
    """Trả về lịch sử làm bài nhóm theo từng phiên submit (cùng section_id + created_at)."""
    attempts = crud.get_by_user(db, user_id)

    # Nhóm theo (section_id, created_at ISO) — mỗi lần submit dùng cùng 1 timestamp
    groups = defaultdict(list)
    for a in attempts:
        ts = a.created_at.isoformat() if a.created_at else "unknown"
        groups[(a.section_id, ts)].append(a)

    history = []
    for (section_id, ts), group in sorted(groups.items(), key=lambda x: x[0][1], reverse=True):
        section = db.query(Section).filter(Section.id == section_id).first()
        total = len(group)
        score = sum(1 for a in group if a.is_correct)
        history.append({
            "section_id": section_id,
            "section_name": section.name if section else f"Section {section_id}",
            "skill": section.skill if section else "unknown",
            "attempted_at": ts,
            "score": score,
            "total": total,
            "percent": round(score / total * 100) if total else 0,
        })

    return history


@router.get("/user/{user_id}/session-detail")
def get_session_detail(
    user_id: int,
    section_id: int,
    attempted_at: str,
    db: Session = Depends(get_db)
):
    """Trả về chi tiết câu hỏi + đáp án của 1 phiên làm cụ thể."""
    try:
        target_dt = datetime.fromisoformat(attempted_at)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid attempted_at format")

    attempts = (
        db.query(UserAttempt)
        .filter(
            UserAttempt.user_id == user_id,
            UserAttempt.section_id == section_id,
            UserAttempt.created_at == target_dt,
        )
        .all()
    )

    results = []
    for attempt in attempts:
        qb = db.query(QuestionBase).filter(QuestionBase.id == attempt.question_id).first()
        if not qb:
            continue

        q_data = {}
        if qb.listening_question_id:
            lq = db.query(ListeningQuestion).filter(
                ListeningQuestion.id == qb.listening_question_id
            ).first()
            if lq:
                q_data = {
                    "question_id": lq.id,
                    "question_number": lq.question_number,
                    "question": lq.question or "",
                    "passage": lq.passage,
                    "audio_url": lq.audio_url,
                    "image_url": lq.image_url,
                    "graphic_url": lq.graphic_url,
                    "option_a": lq.option_a,
                    "option_b": lq.option_b,
                    "option_c": lq.option_c,
                    "option_d": lq.option_d,
                    "correct_answer": lq.correct_answer,
                }
        elif qb.reading_question_id:
            rq = db.query(ReadingQuestion).filter(
                ReadingQuestion.id == qb.reading_question_id
            ).first()
            if rq:
                q_data = {
                    "question_id": rq.id,
                    "question_number": None,
                    "question": rq.question or "",
                    "passage": rq.passage,
                    "audio_url": None,
                    "image_url": None,
                    "graphic_url": None,
                    "option_a": rq.option_a,
                    "option_b": rq.option_b,
                    "option_c": rq.option_c,
                    "option_d": rq.option_d,
                    "correct_answer": rq.correct_answer,
                }

        if q_data:
            results.append({
                **q_data,
                "user_ans": attempt.user_ans,
                "is_correct": attempt.is_correct,
            })

    results.sort(key=lambda r: r.get("question_number") or 0)
    return results


@router.get("/user/{user_id}/weak-areas")
def get_weak_areas(user_id: int, db: Session = Depends(get_db)):
    """Phân tích điểm yếu của user theo từng part/kỹ năng."""
    return crud.get_weak_areas(db, user_id)


@router.get("/user/{user_id}", response_model=list[UserAttemptOut])
def get_attempts_by_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_by_user(db, user_id)


@router.get("/user/{user_id}/section/{section_id}", response_model=list[UserAttemptOut])
def get_attempts_by_user_section(
    user_id: int, section_id: int, db: Session = Depends(get_db)
):
    return crud.get_by_user_section(db, user_id, section_id)


@router.get("/question/{question_id}", response_model=UserAttemptOut)
def get_attempt_by_question(question_id: int, db: Session = Depends(get_db)):
    attempt = crud.get_by_question(db, question_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return attempt


@router.put("/{attempt_id}", response_model=UserAttemptOut)
def update_attempt(
    attempt_id: int, data: UserAttemptUpdate, db: Session = Depends(get_db)
):
    attempt = crud.get_by_id(db, attempt_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return crud.update(db, attempt, data)


@router.delete("/{attempt_id}", status_code=204)
def delete_attempt(attempt_id: int, db: Session = Depends(get_db)):
    attempt = crud.get_by_id(db, attempt_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    crud.delete(db, attempt)
