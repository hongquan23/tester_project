from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    # ==============================
    # APP
    # ==============================
    APP_NAME: str = "Exam Management System"
    DEBUG: bool = True

    # ==============================
    # DATABASE
    # ==============================
    DATABASE_URL: str

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_postgres_url(cls, v: str) -> str:
        # SQLAlchemy 2.x requires "postgresql://" not "postgres://"
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    # ==============================
    # SECURITY / JWT
    # ==============================
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ==============================
    # AI / GROQ
    # ==============================
    GROQ_API_KEY: str  # 👈 THÊM DÒNG NÀY

    # ==============================
    # SMTP / EMAIL
    # ==============================
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    SMTP_FROM_EMAIL: str

    # ==============================
    # CORS
    # ==============================
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
