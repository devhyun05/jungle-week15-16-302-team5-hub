from fastapi import APIRouter

from app.api.v1.endpoints import ai, auth, comments, images, posts, users

api_router = APIRouter()
api_router.include_router(ai.router)
api_router.include_router(auth.router)
api_router.include_router(posts.router)
api_router.include_router(comments.router)
api_router.include_router(users.router)
api_router.include_router(images.router)
