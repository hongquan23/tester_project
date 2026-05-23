from pydantic import BaseModel

class SpeakingQuestionOut(BaseModel):
    id: int
    direction: str | None
    information: str | None
    image_url: str | None
    image_describe: str | None
    question: str | None
    sample_answer: str | None
    part: int
    

class SpeakingQuestionCreate(BaseModel):
    direction: str | None
    information: str | None
    image_url: str | None
    image_describe: str | None
    question: str | None
    sample_answer: str | None
    part: int
    

    

    class Config:
        from_attributes = True
