from sqlalchemy import func, cast, Integer
from sqlalchemy.orm import Session
from models.user_attempt import UserAttempt
from models.question_base import QuestionBase
from schemas.user_attempt import UserAttemptCreate, UserAttemptUpdate


def create(db: Session, data: UserAttemptCreate):
    attempt = UserAttempt(**data.dict())
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


def get_by_id(db: Session, attempt_id: int):
    return db.query(UserAttempt).filter(UserAttempt.id == attempt_id).first()


def get_by_user(db: Session, user_id: int):
    return (
        db.query(UserAttempt)
        .filter(UserAttempt.user_id == user_id)
        .order_by(UserAttempt.created_at.desc())
        .all()
    )


def get_by_user_section(db: Session, user_id: int, section_id: int):
    return (
        db.query(UserAttempt)
        .filter(
            UserAttempt.user_id == user_id,
            UserAttempt.section_id == section_id
        )
        .order_by(UserAttempt.created_at.desc())
        .all()
    )


def get_by_question(db: Session, question_id: int):
    return (
        db.query(UserAttempt)
        .filter(UserAttempt.question_id == question_id)
        .first()
    )


def update(db: Session, attempt: UserAttempt, data: UserAttemptUpdate):
    for field, value in data.dict(exclude_unset=True).items():
        setattr(attempt, field, value)
    db.commit()
    db.refresh(attempt)
    return attempt


def delete(db: Session, attempt: UserAttempt):
    db.delete(attempt)
    db.commit()


def get_chatbot_context(db: Session, user_id: int) -> dict:
    """Tổng hợp dữ liệu học tập cá nhân để cung cấp cho chatbot."""
    from collections import defaultdict
    from models.section import Section

    attempts = (
        db.query(UserAttempt)
        .filter(UserAttempt.user_id == user_id)
        .order_by(UserAttempt.created_at.asc())
        .all()
    )

    if not attempts:
        return {"has_data": False}

    # Nhóm theo (section_id, created_at) = 1 phiên làm bài
    sessions_map = defaultdict(list)
    for a in attempts:
        ts = a.created_at.isoformat() if a.created_at else ""
        sessions_map[(a.section_id, ts)].append(a)

    session_list = []
    section_cache = {}
    for (section_id, ts), group in sorted(sessions_map.items(), key=lambda x: x[0][1]):
        if section_id not in section_cache:
            section_cache[section_id] = db.query(Section).filter(Section.id == section_id).first()
        section = section_cache[section_id]

        answered = [a for a in group if a.user_ans is not None]
        correct = sum(1 for a in answered if a.is_correct)
        total_q = len(group)

        session_list.append({
            "section_name": section.name if section else f"Đề #{section_id}",
            "skill": section.skill if section else "unknown",
            "date": ts[:10],
            "score": correct,
            "total": total_q,
            "answered": len(answered),
            "percent": round(correct / len(answered) * 100) if answered else 0,
        })

    # 5 phiên gần nhất (mới nhất trước)
    recent = list(reversed(session_list[-5:]))

    # Xu hướng: so sánh nửa đầu vs nửa sau
    trend = None
    if len(session_list) >= 4:
        mid = len(session_list) // 2
        def avg_pct(lst):
            valid = [s for s in lst if s["answered"] > 0]
            return round(sum(s["percent"] for s in valid) / len(valid), 1) if valid else 0
        first_avg = avg_pct(session_list[:mid])
        second_avg = avg_pct(session_list[mid:])
        trend = {
            "first_avg": first_avg,
            "second_avg": second_avg,
            "improving": second_avg > first_avg + 1,
            "delta": round(second_avg - first_avg, 1),
        }

    # Thống kê tổng hợp
    valid_sessions = [s for s in session_list if s["answered"] > 0]
    avg_score = round(sum(s["percent"] for s in valid_sessions) / len(valid_sessions), 1) if valid_sessions else 0

    skill_counts: dict = defaultdict(int)
    for s in session_list:
        skill_counts[s["skill"]] += 1
    most_practiced = max(skill_counts, key=lambda k: skill_counts[k]) if skill_counts else None

    best = max(valid_sessions, key=lambda s: s["percent"], default=None)
    worst = min(valid_sessions, key=lambda s: s["percent"], default=None)

    return {
        "has_data": True,
        "total_sessions": len(session_list),
        "avg_score_pct": avg_score,
        "most_practiced_skill": most_practiced,
        "skill_session_counts": dict(skill_counts),
        "recent_sessions": recent,
        "trend": trend,
        "best_session": best,
        "worst_session": worst,
    }


def get_weak_areas(db: Session, user_id: int) -> dict:
    from models.listening_question import ListeningQuestion
    from models.reading_question import ReadingQuestion

    MIN_ATTEMPTS = 3
    WEAK_THRESHOLD = 0.60

    weak_areas = []
    skill_accuracy = {}

    # ── Listening: nhóm theo part ────────────────────────────────────────────
    listening_rows = (
        db.query(
            ListeningQuestion.part,
            func.count(UserAttempt.id).label("total"),
            func.sum(cast(UserAttempt.is_correct, Integer)).label("correct"),
        )
        .select_from(UserAttempt)
        .join(QuestionBase, QuestionBase.id == UserAttempt.question_id)
        .join(ListeningQuestion, ListeningQuestion.id == QuestionBase.listening_question_id)
        .filter(UserAttempt.user_id == user_id, UserAttempt.is_correct.isnot(None), UserAttempt.user_ans.isnot(None))
        .group_by(ListeningQuestion.part)
        .all()
    )

    listening_total = sum(r.total for r in listening_rows)
    listening_correct = sum((r.correct or 0) for r in listening_rows)
    if listening_total > 0:
        skill_accuracy["listening"] = {
            "total": listening_total,
            "correct": listening_correct,
            "accuracy": round(listening_correct / listening_total, 2),
        }

    for row in listening_rows:
        total = row.total or 0
        correct = row.correct or 0
        if total >= MIN_ATTEMPTS:
            accuracy = correct / total
            if accuracy < WEAK_THRESHOLD:
                weak_areas.append({
                    "skill": "listening",
                    "part": row.part,
                    "part_label": f"Listening Part {row.part}",
                    "total_attempts": total,
                    "correct": correct,
                    "accuracy": round(accuracy, 2),
                    "level": "weak" if accuracy < 0.40 else "fair",
                })

    # ── Reading: không có trường part, gom thành 1 nhóm ─────────────────────
    reading_row = (
        db.query(
            func.count(UserAttempt.id).label("total"),
            func.sum(cast(UserAttempt.is_correct, Integer)).label("correct"),
        )
        .select_from(UserAttempt)
        .join(QuestionBase, QuestionBase.id == UserAttempt.question_id)
        .join(ReadingQuestion, ReadingQuestion.id == QuestionBase.reading_question_id)
        .filter(UserAttempt.user_id == user_id, UserAttempt.is_correct.isnot(None), UserAttempt.user_ans.isnot(None))
        .first()
    )

    if reading_row and (reading_row.total or 0) >= MIN_ATTEMPTS:
        total = reading_row.total
        correct = reading_row.correct or 0
        accuracy = correct / total
        skill_accuracy["reading"] = {
            "total": total,
            "correct": correct,
            "accuracy": round(accuracy, 2),
        }
        if accuracy < WEAK_THRESHOLD:
            weak_areas.append({
                "skill": "reading",
                "part": None,
                "part_label": "Reading",
                "total_attempts": total,
                "correct": correct,
                "accuracy": round(accuracy, 2),
                "level": "weak" if accuracy < 0.40 else "fair",
            })

    weak_areas.sort(key=lambda x: x["accuracy"])

    total_mcq = (
        db.query(func.count(UserAttempt.id))
        .filter(UserAttempt.user_id == user_id, UserAttempt.is_correct.isnot(None), UserAttempt.user_ans.isnot(None))
        .scalar()
        or 0
    )

    return {
        "weak_areas": weak_areas,
        "skill_accuracy": skill_accuracy,
        "total_mcq_attempts": total_mcq,
    }
