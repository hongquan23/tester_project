from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config import settings
from core.middleware import JWTAuthMiddleware
from api.api_router import api_router
from fastapi.staticfiles import StaticFiles
from db.init_db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="toeic exam",
        version="1.0.0",
        description="An API for managing TOEIC exam data",
        lifespan=lifespan,
    )

    # FastAPI builds middleware as LIFO stack: last added = outermost layer.
    # JWTAuthMiddleware must be added first so CORS runs before it.
    app.add_middleware(JWTAuthMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


    app.include_router(api_router, prefix="/api")

    return app
app = create_app()
app.mount("/images", StaticFiles(directory="images"), name="images")
app.mount("/audio", StaticFiles(directory="audio"), name="audio")
