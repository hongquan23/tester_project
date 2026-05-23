from sqlalchemy.orm import Session
from models.speaking_question import SpeakingQuestion
from models.question_base import QuestionBase


def get_by_section(db: Session, section_id: int):
    return (
        db.query(SpeakingQuestion)
        .join(
            QuestionBase,
            SpeakingQuestion.id == QuestionBase.speaking_question_id
        )
        .filter(QuestionBase.section_id == section_id)
        .all()
    )


def create(db: Session, data: dict, section_id: int):
    # 1. tạo speaking_question trước
    q = SpeakingQuestion(**data)
    db.add(q)
    db.flush()  # lấy q.id

    # 2. tạo question_base và gán FK
    base = QuestionBase(
        section_id=section_id,
        speaking_question_id=q.id
    )
    db.add(base)

    db.commit()
    db.refresh(q)
    return q
