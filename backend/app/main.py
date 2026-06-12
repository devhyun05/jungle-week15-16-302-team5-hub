"""FastAPI application entry point.

Session 00 target:
- Explain what backend feature this unlocks for the frontend.
- Rebuild the app factory, CORS middleware, router registration, and health check.
- Verify it with `tests/test_health.py`.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, comments, posts, tags


def create_app() -> FastAPI:
    app = FastAPI(title="Malang Lab API")

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

    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(posts.router, prefix="/posts", tags=["posts"])
    app.include_router(comments.router, tags=["comments"])
    app.include_router(tags.router, prefix="/tags", tags=["tags"])

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
