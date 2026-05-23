from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate

def get_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_all(db: Session):
    return db.query(User).all()

def create(db: Session, user_in: UserCreate, password_hash: str):
    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=password_hash,
        role=user_in.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def delete(db: Session, user_id: int):
    user = get_by_id(db, user_id)
    if user:
        db.delete(user)
        db.commit()
    return user

def update_name(db: Session, user_id: int, new_name: str):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return None

    user.name = new_name
    db.commit()
    db.refresh(user)

    return user


def update_password(db: Session, user_id: int, new_password_hash: str):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return None

    user.password_hash = new_password_hash
    db.commit()
    db.refresh(user)

    return user
