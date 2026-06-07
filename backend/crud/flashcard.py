from sqlalchemy.orm import Session
from models.flashcard import Flashcard
from schemas.flashcard import FlashcardCreate, FlashcardUpdate
from datetime import datetime, timedelta


def create(db: Session, data: FlashcardCreate) -> Flashcard:
    card = Flashcard(**data.model_dump())
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


def get_by_user(db: Session, user_id: int) -> list[Flashcard]:
    return (
        db.query(Flashcard)
        .filter(Flashcard.user_id == user_id)
        .order_by(Flashcard.created_at.desc())
        .all()
    )


def get_due_for_review(db: Session, user_id: int) -> list[Flashcard]:
    now = datetime.utcnow()
    return (
        db.query(Flashcard)
        .filter(
            Flashcard.user_id == user_id,
            Flashcard.is_known == False,
            (Flashcard.next_review == None) | (Flashcard.next_review <= now),
        )
        .all()
    )


def get_by_id(db: Session, card_id: int) -> Flashcard | None:
    return db.query(Flashcard).filter(Flashcard.id == card_id).first()


def update(db: Session, card: Flashcard, data: FlashcardUpdate) -> Flashcard:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(card, field, value)
    db.commit()
    db.refresh(card)
    return card


def mark_known(db: Session, card: Flashcard) -> Flashcard:
    card.is_known = True
    card.review_count += 1
    db.commit()
    db.refresh(card)
    return card


def mark_unknown(db: Session, card: Flashcard) -> Flashcard:
    card.is_known = False
    card.review_count += 1
    # Spaced repetition: next review in 1 day if unknown
    card.next_review = datetime.utcnow() + timedelta(days=1)
    db.commit()
    db.refresh(card)
    return card


def delete(db: Session, card: Flashcard) -> None:
    db.delete(card)
    db.commit()
