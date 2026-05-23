from sqlalchemy.orm import Session
from fastapi import HTTPException

from crud import (
    test as test_crud,
    section as section_crud,
    done_test as done_test_crud
)

def start_test(db: Session, test_id: int, user_id: int):
    test = test_crud.get_by_id(db, test_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    sections = section_crud.get_by_test_id(db, test_id)

    return {
        "test": test,
        "sections": sections
    }


def submit_test(
    db: Session,
    user_id: int,
    test_id: int,
    answers: dict
):
    """
    answers = {
        section_id: {
            question_id: user_answer
        }
    }
    """

    done_test = done_test_crud.create(
        db=db,
        user_id=user_id,
        test_id=test_id,
        answers=answers
    )

    return done_test
