from sqlalchemy.orm import Session

from models.reading_question import ReadingQuestion
from models.question_base import QuestionBase


def get_by_section(db: Session, section_id: int):
    """
    Lấy tất cả ReadingQuestion thuộc 1 section
    thông qua question_base (FK nằm ở question_base)
    """
    return (
        db.query(ReadingQuestion)
        .join(
            QuestionBase,
            QuestionBase.reading_question_id == ReadingQuestion.id
        )
        .filter(
            QuestionBase.section_id == section_id,
            QuestionBase.skill == "reading"
        )
        .all()
    )


def create(db: Session, data: dict, section_id: int):
    """
    Tạo ReadingQuestion + QuestionBase tương ứng
    """
    # 1. Tạo reading_question
    reading = ReadingQuestion(**data)
    db.add(reading)
    db.flush()  # lấy reading.id

    # 2. Tạo question_base
    qb = QuestionBase(
        section_id=section_id,
        skill="reading",
        reading_question_id=reading.id
    )
    db.add(qb)

    # 3. Commit
    db.commit()
    db.refresh(reading)

    return reading


def create_bulk(db: Session, questions: list[dict], section_id: int):
    created = []
    for data in questions:
        reading = ReadingQuestion(**data)
        db.add(reading)
        db.flush()

        qb = QuestionBase(
            section_id=section_id,
            skill="reading",
            reading_question_id=reading.id
        )
        db.add(qb)
        created.append(reading)

    db.commit()
    for r in created:
        db.refresh(r)
    return created


def delete(db: Session, question_id: int):
    """
    Xóa ReadingQuestion và QuestionBase liên quan
    """
    reading = (
        db.query(ReadingQuestion)
        .filter(ReadingQuestion.id == question_id)
        .first()
    )

    if not reading:
        return None

    qb = (
        db.query(QuestionBase)
        .filter(QuestionBase.reading_question_id == reading.id)
        .first()
    )

    if qb:
        db.delete(qb)

    db.delete(reading)
    db.commit()

    return reading
