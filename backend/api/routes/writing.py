
import json
import os
import tempfile
from services.speaking_AI.toeic_scorer import score_toeic_w_q1_5, score_toeic_w_q6_7, score_toeic_w_q8

from fastapi import APIRouter, Depends,Form, File, UploadFile
from sqlalchemy.orm import Session
import uuid
from api.deps import get_db
from schemas.writing import WritingQuestionCreate, WritingQuestionOut
from crud import writing as writing_crud

router = APIRouter()
UPLOAD_DIR = "images/writing/"

@router.post("/", response_model=WritingQuestionOut)
def create_writing_question(
    section_id: int = Form(...),
    question: str = Form(...),
    passage: str = Form(None),
    part: int = Form(...),
    image: UploadFile | None = File(None),
    image_describe: str = Form(None),
    sample_answer: str = Form(None),
    required_word_1 : str = Form(None),
    required_word_2 : str = Form(None),
    db: Session = Depends(get_db)
):
    image_path = None

    # 1. Upload image (giống speaking)
    if image:
        ext = image.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as f:
            f.write(image.file.read())

        image_path = file_path

    # 2. Data cho WritingQuestion
    data = {
        "question": question,
        "passage": passage,
        "required_word_1": required_word_1,
        "required_word_2": required_word_2,
        "part": part,
        "image_url": image_path,
        "image_describe": image_describe,
        "sample_answer": sample_answer,
        "required_word_1": required_word_1,
        "required_word_2": required_word_2
    }

    # 3. Gọi CRUD
    return writing_crud.create(
        db=db,
        data=data,
        section_id=section_id
    )


@router.get("/section/{section_id}", response_model=list[WritingQuestionOut])
def get_questions(section_id: int, db: Session = Depends(get_db)):
    return writing_crud.get_by_section(db, section_id)

@router.post("/q1_5")
def writing_part1(
    image_description: str = Form(...),
    required_word_1: str = Form(...),
    required_word_2: str = Form(...),
    student_sentence: str = Form(...)
):
    required_words_list = [required_word_1, required_word_2]

    evaluation = score_toeic_w_q1_5(
        image_description,
        required_words_list,
        student_sentence
    )

   

    return {
        "feedback": evaluation
    }


@router.post("/q6_7")
def writing_q6_7(
    email_prompt: str = Form(...),
    directions: str = Form(...),
    student_response: str = Form(...)
):
    evaluation = score_toeic_w_q6_7(
        email_prompt,
        student_response,
        directions
    )

    return {
        "feedback": evaluation
    }


@router.post("/q8")
def writing_q8(
    question: str = Form(...),
    student_response: str = Form(...)
):
    evaluation = score_toeic_w_q8(
        question,
        student_response
    )

    return {
        "feedback": evaluation
    }