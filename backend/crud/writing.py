from sqlalchemy.orm import Session

from models.writing_question import WritingQuestion
from models.question_base import QuestionBase


def get_by_section(db: Session, section_id: int):
    """
    Lấy danh sách WritingQuestion theo section_id
    (FK nằm ở question_base)
    """
    return (
        db.query(WritingQuestion)
        .join(
            QuestionBase,
            QuestionBase.writing_question_id == WritingQuestion.id
        )
        .filter(QuestionBase.section_id == section_id)
        .all()
    )


def create(db: Session, data: dict, section_id: int):
    """
    Tạo writing_question + question_base
    """

    # 1. Tạo writing_question trước
    writing_question = WritingQuestion(**data)
    db.add(writing_question)
    db.flush()  # lấy writing_question.id

    # 2. Tạo question_base, gán FK
    base = QuestionBase(
        section_id=section_id,
        writing_question_id=writing_question.id
    )
    db.add(base)

    db.commit()
    db.refresh(writing_question)
    return writing_question
