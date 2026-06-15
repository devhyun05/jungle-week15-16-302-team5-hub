from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.admin import router as admin_router
from app.routers.auth import router as auth_router
from app.routers.comments import router as comments_router
from app.routers.health import router as health_router
from app.routers.me import router as me_router
from app.routers.portfolio import router as portfolio_router
from app.routers.posts import router as posts_router
from app.routers.reviews import router as reviews_router


# FastAPI 애플리케이션 객체다.
# title은 Swagger UI 상단에 보이는 API 이름으로 사용된다.
app = FastAPI(title=settings.app_name)

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
