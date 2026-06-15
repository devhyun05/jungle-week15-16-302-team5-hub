"""FastAPI 애플리케이션 진입점.

세션 00 목표:
- 이 백엔드 기능이 프론트의 어떤 연결을 열어 주는지 설명한다.
- 앱 생성 함수, CORS 미들웨어, 라우터 등록, 상태 확인 API를 다시 만든다.
- `tests/test_health.py`로 확인한다.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import auth, comments, posts, tags


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Malang Lab API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(posts.router, prefix="/posts", tags=["posts"])
    app.include_router(comments.router, tags=["comments"])
    app.include_router(tags.router, prefix="/tags", tags=["tags"])

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
