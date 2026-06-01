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
    name: str = Field(min_length=1, strip_whitespace=True)

class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)

class UserOut(UserBase):
    id: int
    created_at: Optional[datetime] = None 

    class Config:
        from_attributes = True
