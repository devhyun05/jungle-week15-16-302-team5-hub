from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.dependencies.auth import get_current_approved_user
from app.schemas.post import PostListResponse
from app.services import post_service


router = APIRouter(prefix="/me", tags=["me"])


@router.get("/posts", response_model=PostListResponse)
def get_my_posts(
    category: str | None = Query(default=None),
    keyword: str | None = Query(default=None),
    visibility: Literal["all", "public", "private"] = Query(default="all"),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=50, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_approved_user),
) -> PostListResponse:
    """
    현재 로그인 사용자가 작성한 게시글 목록을 반환한다.
    """

    return post_service.get_my_posts(
        db=db,
        current_user=current_user,
        category=category,
        keyword=keyword,
        visibility=visibility,
        page=page,
        size=size,
    )
