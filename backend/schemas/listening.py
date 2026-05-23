from pydantic import BaseModel


class ListeningQuestionOut(BaseModel):
    id: int
    part: int | None
    question_number: int | None
    directions: str | None
    passage: str | None
    question: str
    graphic_url: str | None
    audio_url: str | None
    image_url: str | None
    option_a: str
    option_b: str
    option_c: str
    option_d: str | None
    correct_answer: str | None

    class Config:
        from_attributes = True


class ListeningQuestionCreate(BaseModel):
    part: int | None = None
    question_number: int | None = None
    directions: str | None = None
    passage: str | None = None
    question: str
    graphic_url: str | None = None
    audio_url: str | None = None
    image_url: str | None = None
    option_a: str
    option_b: str
    option_c: str
    option_d: str | None = None
    correct_answer: str | None = None

    class Config:
        from_attributes = True


class ListeningBulkUpload(BaseModel):
    title: str
    time_limit: int
    questions: list[ListeningQuestionCreate]


# ── ETS JSON format schemas ──────────────────────────────────────────────────

class EtsOptions(BaseModel):
    A: str
    B: str
    C: str | None = None
    D: str | None = None


class EtsQuestion(BaseModel):
    question_number: int
    question: str | None = None
    options: EtsOptions
    correct_answer: str
    image_url: str | None = None


class EtsConversation(BaseModel):
    conversation_id: str
    question_numbers: list[int]
    transcript: str
    graphic: dict | None = None         # bỏ qua khi lưu DB, admin upload ảnh riêng
    questions: list[EtsQuestion]


class EtsTalk(BaseModel):
    talk_id: str
    question_numbers: list[int]
    transcript: str
    graphic: dict | None = None         # bỏ qua khi lưu DB, admin upload ảnh riêng
    questions: list[EtsQuestion]


class EtsPart(BaseModel):
    part_number: int
    title: str
    directions: str
    questions: list[EtsQuestion] | None = None
    conversations: list[EtsConversation] | None = None
    talks: list[EtsTalk] | None = None


class EtsAudioUrl(BaseModel):
    url: str


class EtsData(BaseModel):
    audio_url: EtsAudioUrl | None = None
    parts: list[EtsPart]


class ListeningEtsUpload(BaseModel):
    title: str
    time_limit: int
    ets_data: EtsData
