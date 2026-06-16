from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.init_db import init_db
from app.routers.admin import router as admin_router
from app.routers.ai import router as ai_router
from app.routers.auth import router as auth_router
from app.routers.comments import router as comments_router
from app.routers.health import router as health_router
from app.routers.me import router as me_router
from app.routers.notifications import router as notifications_router
from app.routers.portfolio import router as portfolio_router
from app.routers.posts import router as posts_router
from app.routers.reviews import router as reviews_router


# FastAPI 애플리케이션 객체다.
# title은 Swagger UI 상단에 보이는 API 이름으로 사용된다.
app = FastAPI(title=settings.app_name)


@app.on_event("startup")
def startup() -> None:
    """
    로컬 개발 서버 시작 시 테이블과 v1 보강 column을 준비한다.
    """

    init_db()

# 로컬 개발 단계에서는 사용자가 업로드한 프로필 이미지를 backend/uploads 아래에 저장한다.
# 배포 단계에서는 이 mount를 S3 같은 외부 스토리지 URL로 교체할 수 있다.
upload_dir = Path(settings.upload_dir)

if not upload_dir.is_absolute():
    upload_dir = Path(__file__).resolve().parents[1] / upload_dir

upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# React 개발 서버와 FastAPI 서버는 포트가 다르므로 origin이 다르다.
# 브라우저는 다른 origin 요청을 기본적으로 막기 때문에 CORS 허용 설정이 필요하다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.backend_cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 각 router는 기능별 endpoint 묶음이다.
# main.py는 router를 모아 FastAPI app에 등록하는 진입점 역할만 한다.
app.include_router(health_router)
app.include_router(posts_router)
app.include_router(comments_router)
app.include_router(me_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(portfolio_router)
app.include_router(reviews_router)
app.include_router(notifications_router)
app.include_router(ai_router)
