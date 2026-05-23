from pydantic import BaseModel

class SectionBase(BaseModel):
    skill: str
    time_limit: int
    name : str

class SectionOut(SectionBase):
    id: int
    attempt_count: int = 0

    class Config:
        from_attributes = True

class SectionCreate(SectionBase):
    pass
