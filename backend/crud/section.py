from sqlalchemy.orm import Session
from sqlalchemy import func
from models.section import Section
from models.user_attempt import UserAttempt
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
