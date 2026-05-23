from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from crud import user as user_crud
from schemas.user import UserCreate, UserLogin, ChangePassword
from core.security import (
    hash_password,
    verify_password,
    create_access_token
)


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return int(user_id)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

def update_name(db: Session, user_id: int, new_name: str):

    user = user_crud.update_name(db, user_id, new_name)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {"message": "Name updated successfully"}

def register_user(db: Session, user_in: UserCreate):
    if user_crud.get_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

    password_hash = hash_password(user_in.password)
    return user_crud.create(db, user_in, password_hash)


def login_user(db: Session, user_in: UserLogin):
    user = user_crud.get_by_email(db, user_in.email)
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    access_token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }


def change_password(db: Session, user_id: int, data: ChangePassword):

    user = user_crud.get_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # kiểm tra mật khẩu cũ
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password incorrect"
        )

    # hash mật khẩu mới
    new_hash = hash_password(data.new_password)

    user_crud.update_password(db, user_id, new_hash)

    return {"message": "Password updated successfully"}
