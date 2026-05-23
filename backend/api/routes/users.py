from http.client import HTTPException

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_db
from crud import user as user_crud
from schemas.user import UserOut, UpdateName

router = APIRouter()

@router.get("/", response_model=list[UserOut])
def get_users(db: Session = Depends(get_db)):
    return user_crud.get_all(db)

@router.get("/{user_id}",response_model = UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return user_crud.get_by_id(db, user_id)

@router.delete("/{user_id}", response_model = UserOut)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    return user_crud.delete(db, user_id)



@router.put("/update-name/{user_id}", response_model=UserOut)
def update_name(
    user_id: int,
    data: UpdateName,
    db: Session = Depends(get_db)
):
    user = user_crud.update_name(db, user_id, data.name)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
