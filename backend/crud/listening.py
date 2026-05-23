from sqlalchemy.orm import Session

from models.listening_question import ListeningQuestion
from models.question_base import QuestionBase


def get_by_section(db: Session, section_id: int):
    """
    Lấy tất cả ListeningQuestion thuộc 1 section
    Thông qua bảng trung gian question_base
    """
    return (
        db.query(ListeningQuestion)
        .join(
            QuestionBase,
            QuestionBase.listening_question_id == ListeningQuestion.id
        )
        .filter(
            QuestionBase.section_id == section_id,
            QuestionBase.skill == "listening"
        )
        .order_by(ListeningQuestion.question_number.asc(), ListeningQuestion.id.asc())
        .all()
    )


def create(db: Session, data: dict, section_id: int):
    """
    Tạo ListeningQuestion + QuestionBase tương ứng
    """
    # 1. Tạo listening_question
    listening = ListeningQuestion(**data)
    db.add(listening)
    db.flush()  # để lấy listening.id ngay, chưa commit

    # 2. Tạo question_base
    qb = QuestionBase(
        section_id=section_id,
        skill="listening",
        listening_question_id=listening.id
    )
    db.add(qb)

    # 3. Commit transaction
    db.commit()
    db.refresh(listening)

    return listening


def create_bulk(db: Session, questions: list[dict], section_id: int):
    created = []
    for data in questions:
        listening = ListeningQuestion(**data)
        db.add(listening)
        db.flush()

        qb = QuestionBase(
            section_id=section_id,
            skill="listening",
            listening_question_id=listening.id
        )
        db.add(qb)
        created.append(listening)

    db.commit()
    for r in created:
        db.refresh(r)
    return created


def delete(db: Session, question_id: int):
    """
    Xóa ListeningQuestion và QuestionBase liên quan
    """
    listening = (
        db.query(ListeningQuestion)
        .filter(ListeningQuestion.id == question_id)
        .first()
    )

    if not listening:
        return None

    # Tìm question_base tương ứng
    qb = (
        db.query(QuestionBase)
        .filter(QuestionBase.listening_question_id == listening.id)
        .first()
    )

    if qb:
        db.delete(qb)

    db.delete(listening)
    db.commit()

    return listening
