from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.post import PostListResponse
from app.services import post_service


router = APIRouter(prefix="/me", tags=["me"])


@router.get("/posts", response_model=PostListResponse)
def get_my_posts(
    # 내 기록 화면의 카테고리 필터다. 예: /me/posts?category=learning-log
    category: str | None = Query(default=None),
    # 내 기록 화면의 검색어다. 제목, 요약, 본문, 태그, 카테고리에서 검색한다.
    keyword: str | None = Query(default=None),
    # 공개 범위 필터다. all은 공개/비공개를 모두 보여준다.
    visibility: Literal["all", "public", "private"] = Query(default="all"),
    # 페이지 번호는 1부터 시작한다.
    page: int = Query(default=1, ge=1),
    # 한 번에 너무 많은 데이터를 가져오지 않도록 최대 50개로 제한한다.
    size: int = Query(default=50, ge=1, le=50),
    db: Session = Depends(get_db),
) -> PostListResponse:
    """
    현재 로그인 사용자의 게시글 목록을 반환한다.

    지금은 JWT/OAuth2 연결 전이라 demo student를 현재 사용자처럼 사용한다.
    인증 구현 후에는 demo user 조회를 제거하고 JWT에서 꺼낸 current user id로 조회한다.
    """

    try:
        return post_service.get_my_posts(
            db=db,
            category=category,
            keyword=keyword,
            visibility=visibility,
            page=page,
            size=size,
        )
    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
