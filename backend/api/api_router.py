
from fastapi import APIRouter

from api.routes import (
    auth,
    users,
    user_attempt,
    sections,
    listening,
    reading,
    writing,
    speaking,
    chatbot,
    flashcard,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(user_attempt.router, prefix="/user-attempts", tags=["User Attempt"])
api_router.include_router(sections.router, prefix="/sections", tags=["Sections"])
api_router.include_router(listening.router, prefix="/listening", tags=["Listening"])
api_router.include_router(reading.router, prefix="/reading", tags=["Reading"])
api_router.include_router(writing.router, prefix="/writing", tags=["Writing"])
api_router.include_router(speaking.router, prefix="/speaking", tags=["Speaking"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
api_router.include_router(flashcard.router, prefix="/flashcards", tags=["Flashcard"])


print("API router initialized with routes: auth, users, user_attempt, sections, listening, reading, writing, speaking, chatbot, flashcard")