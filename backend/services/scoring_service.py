from sqlalchemy.orm import Session

from crud import (
    listening as listening_crud,
    reading as reading_crud
)

def score_listening(db: Session, user_answers: dict):
    """
    user_answers = {question_id: answer}
    """
    score = 0
    total = len(user_answers)

    for q_id, user_answer in user_answers.items():
        question = listening_crud.get_by_id(db, q_id)
        if question and question.correct_answer == user_answer:
            score += 1

    return {
        "score": score,
        "total": total
    }


def score_reading(db: Session, user_answers: dict):
    score = 0
    total = len(user_answers)

    for q_id, user_answer in user_answers.items():
        question = reading_crud.get_by_id(db, q_id)
        if question and question.correct_answer == user_answer:
            score += 1

    return {
        "score": score,
        "total": total
    }
