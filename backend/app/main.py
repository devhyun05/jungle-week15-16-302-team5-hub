from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.db.base import Base
from app.db.session import engine
from app.models.session import UserSession  # noqa: F401
from app.models.user import User  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="GlowBoard API", lifespan=lifespan)

app.include_router(auth_router)


@app.get("/health")
def health():
    return {"status": "ok"}
