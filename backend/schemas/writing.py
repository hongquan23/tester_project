from pydantic import BaseModel

class WritingQuestionOut(BaseModel):
    id: int
    image_url: str | None
    passage: str | None
    question: str
    sample_answer: str | None
    image_describe: str | None
    part: int 
    required_word_1 : str | None
    required_word_2 : str | None  
    

class WritingQuestionCreate(BaseModel):
    image_url: str | None
    passage: str | None
    question: str
    sample_answer: str | None
    image_describe: str | None
    part: int
    required_word_1 : str | None
    required_word_2 : str | None
    

    

    class Config:
        from_attributes = True
