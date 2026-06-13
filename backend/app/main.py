# FastAPI는 백엔드 앱 객체를 만드는 클래스다.
from fastapi import FastAPI
# CORSMiddleware는 React dev server가 FastAPI API를 호출할 수 있게 허용한다.
from fastapi.middleware.cors import CORSMiddleware

# settings는 .env/config.py에서 읽어온 앱 설정이다.
from app.core.config import settings
# health_router는 /health, /health/db endpoint 묶음이다.
from app.routers.health import router as health_router
# posts_router는 /posts, /posts/{post_id} endpoint 묶음이다.
from app.routers.posts import router as posts_router

from app.routers.comments import router as comments_router
# FastAPI 앱 인스턴스를 만든다.
# title은 Swagger UI 상단에 보이는 API 이름이다.
app = FastAPI(title=settings.app_name)

# 브라우저는 보안상 다른 origin 요청을 기본적으로 막는다.
# React는 localhost:5173, FastAPI는 localhost:8000이라 origin이 다르므로 CORS 허용이 필요하다.
app.add_middleware(
    CORSMiddleware,
    # .env에 설정한 프론트엔드 주소만 API 호출을 허용한다.
    allow_origins=[settings.backend_cors_origins],
    # 쿠키/인증 정보가 필요한 요청도 허용할 수 있게 둔다.
    allow_credentials=True,
    # GET, POST, PATCH, DELETE 같은 모든 HTTP method를 허용한다.
    allow_methods=["*"],
    # Authorization, Content-Type 같은 header를 허용한다.
    allow_headers=["*"],
)

# health router를 app에 등록한다.
app.include_router(health_router)
# posts router를 app에 등록한다.
# 이 줄이 있어야 Swagger UI에 /posts가 보인다.
app.include_router(posts_router)

app.include_router(comments_router)
