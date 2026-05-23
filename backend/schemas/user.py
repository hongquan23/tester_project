from pydantic import BaseModel
from datetime import datetime
from pydantic import Field
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: str
    role: str

class UserCreate(UserBase):
    password: str 

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class UpdateName(BaseModel):
    name: str 

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

class UserOut(UserBase):
    id: int
    created_at: Optional[datetime] = None 

    class Config:
        from_attributes = True
