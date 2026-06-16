from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.posts import router as posts_router
from app.api.routes.comments import router as comments_router
from app.api.routes.tags import router as tags_router
from app.api.routes.admin import router as admin_router
from app.api.routes.users import router as users_router
from app.db.base import Base
from app.db.session import engine
from app.models.post import Post  # noqa: F401
from app.models.comment import Comment  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.session import UserSession  # noqa: F401
from app.models.refresh_token import RefreshToken  # noqa: F401
from app.models.admin_action_log import AdminActionLog  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="GlowBoard API", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(comments_router)
app.include_router(tags_router)
app.include_router(admin_router)
app.include_router(users_router)


@app.get("/health")
def health():
    return {"status": "ok"}
