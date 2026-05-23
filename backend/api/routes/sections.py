from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from api.deps import get_db
from schemas.section import SectionCreate, SectionOut
from crud import section as section_crud

class SectionUpdate(BaseModel):
    time_limit: int | None = None
    name: str | None = None

router = APIRouter()

@router.post("/create", response_model=SectionOut)
def create_section(
    section_in: SectionCreate,
    db: Session = Depends(get_db)
):
    return section_crud.create(db, section_in)

@router.get("/", response_model=list[SectionOut])
def get_sections(skill: str | None = None, db: Session = Depends(get_db)):
    if skill:
        return section_crud.get_by_skill(db, skill)
    return section_crud.get_all(db)

@router.put("/{section_id}", response_model=SectionOut)
def update_section(section_id: int, data: SectionUpdate, db: Session = Depends(get_db)):
    section = section_crud.get_by_id(db, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    if data.time_limit is not None:
        section.time_limit = data.time_limit
    if data.name is not None:
        section.name = data.name
    db.commit()
    db.refresh(section)
    return section

@router.delete("/{section_id}")
def delete_section(section_id: int, db: Session = Depends(get_db)):
    return section_crud.delete(db, section_id)
