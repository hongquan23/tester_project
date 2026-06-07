from sqlalchemy.orm import Session
from sqlalchemy import func
from models.section import Section
from models.user_attempt import UserAttempt
from models.question_base import QuestionBase
from models.speaking_question import SpeakingQuestion
from models.writing_question import WritingQuestion
from models.listening_question import ListeningQuestion
from models.reading_question import ReadingQuestion
from schemas.section import SectionBase

def get_all(db: Session):
    sections = db.query(Section).all()
    return add_attempt_counts(db, sections)

def get_all_raw(db: Session):
    return db.query(Section).all()

def get_by_id(db: Session, section_id: int):
    section = db.query(Section).filter(Section.id == section_id).first()
    if section:
        subq = (
            db.query(UserAttempt.user_id, UserAttempt.created_at)
            .filter(UserAttempt.section_id == section_id)
            .distinct()
            .subquery()
        )
        section.attempt_count = db.query(func.count()).select_from(subq).scalar() or 0
    return section

def create(db: Session,  section_in: SectionBase):
    section = Section(**section_in.dict())
    db.add(section)
    db.commit()
    db.refresh(section)
    section.attempt_count = 0
    return section

def get_by_skill(db: Session, skill: str):
    sections = db.query(Section).filter(Section.skill == skill).all()
    return add_attempt_counts(db, sections)

def delete(db: Session, section_id: int):
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section:
        return {"message": "Section not found"}

    question_bases = db.query(QuestionBase).filter(QuestionBase.section_id == section_id).all()
    qb_ids         = [qb.id for qb in question_bases]
    speaking_ids   = [qb.speaking_question_id  for qb in question_bases if qb.speaking_question_id]
    writing_ids    = [qb.writing_question_id    for qb in question_bases if qb.writing_question_id]
    listening_ids  = [qb.listening_question_id  for qb in question_bases if qb.listening_question_id]
    reading_ids    = [qb.reading_question_id    for qb in question_bases if qb.reading_question_id]

    # 1. user_attempt (references question_base.id và section.id)
    if qb_ids:
        db.query(UserAttempt).filter(UserAttempt.question_id.in_(qb_ids)).delete(synchronize_session=False)
    db.query(UserAttempt).filter(UserAttempt.section_id == section_id).delete(synchronize_session=False)

    # 2. question_base (references các bảng câu hỏi bên dưới)
    if qb_ids:
        db.query(QuestionBase).filter(QuestionBase.id.in_(qb_ids)).delete(synchronize_session=False)
    db.flush()

    # 3. Câu hỏi thực (không còn FK nào trỏ vào nữa)
    if speaking_ids:
        db.query(SpeakingQuestion).filter(SpeakingQuestion.id.in_(speaking_ids)).delete(synchronize_session=False)
    if writing_ids:
        db.query(WritingQuestion).filter(WritingQuestion.id.in_(writing_ids)).delete(synchronize_session=False)
    if listening_ids:
        db.query(ListeningQuestion).filter(ListeningQuestion.id.in_(listening_ids)).delete(synchronize_session=False)
    if reading_ids:
        db.query(ReadingQuestion).filter(ReadingQuestion.id.in_(reading_ids)).delete(synchronize_session=False)

    # 4. Section
    db.delete(section)
    db.commit()
    return {"message": "Section deleted successfully"}

def add_attempt_counts(db: Session, sections: list):
    if not sections:
        return sections

    section_ids = [s.id for s in sections]

    # Count distinct (user_id, created_at) pairs per section = unique test sessions
    subq = (
        db.query(UserAttempt.section_id, UserAttempt.user_id, UserAttempt.created_at)
        .filter(UserAttempt.section_id.in_(section_ids))
        .distinct()
        .subquery()
    )
    counts = (
        db.query(subq.c.section_id, func.count().label("cnt"))
        .group_by(subq.c.section_id)
        .all()
    )
    count_map = {row.section_id: row.cnt for row in counts}

    for section in sections:
        section.attempt_count = count_map.get(section.id, 0)
    return sections
