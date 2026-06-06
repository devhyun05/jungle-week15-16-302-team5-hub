from fastapi import FastAPI

from app.routers import ai, auth, comments, posts, tags


def create_app() -> FastAPI:
    """Create the FastAPI app and register routers.

    TODO:
    - CORS 설정을 추가한다.
    - DB 연결 생명주기를 설정한다.
    - auth/posts/comments/tags/ai router를 연결한다.
    """
    app = FastAPI(title="Malang Lab API")
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(posts.router, prefix="/posts", tags=["posts"])
    app.include_router(comments.router, tags=["comments"])
    app.include_router(tags.router, prefix="/tags", tags=["tags"])
    app.include_router(ai.router, prefix="/ai", tags=["ai"])

    @app.get("/health")
    def health_check() -> dict[str, str]:
      return {"status": "ok"}

    return app


app = create_app()
