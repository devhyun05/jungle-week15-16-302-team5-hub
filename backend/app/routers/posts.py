# APIRouter는 API endpoint를 파일별로 나눠 관리하게 해준다.
# Depends는 get_db 같은 의존성을 API 함수에 주입한다.
# HTTPException은 404 같은 HTTP 오류를 직접 반환할 때 쓴다.
# Query는 query string의 기본값과 검증 조건을 정한다.
from fastapi import APIRouter, Depends, HTTPException, Query
# Session은 SQLAlchemy DB session 타입이다.
from sqlalchemy.orm import Session

# get_db는 요청마다 DB session을 열고 닫아주는 FastAPI dependency다.
from app.db.session import get_db
# response_model에 넣을 Pydantic schema다.
from app.schemas.post import PostDetailResponse, PostListResponse
# router는 service를 호출하고, service가 실제 응답 조립을 맡는다.
from app.services import post_service


# prefix="/posts"라서 이 파일의 모든 endpoint는 /posts로 시작한다.
# tags=["posts"]는 Swagger UI에서 posts 그룹으로 묶이게 해준다.
router = APIRouter(prefix="/posts", tags=["posts"])


# GET /posts endpoint다.
# response_model은 이 API가 PostListResponse 모양의 JSON을 반환한다는 뜻이다.
@router.get("", response_model=PostListResponse)
def get_posts(
    # /posts?category=learning-log 처럼 카테고리 slug를 query string으로 받는다.
    category: str | None = Query(default=None),
    # /posts?keyword=JWT 처럼 검색어를 query string으로 받는다.
    keyword: str | None = Query(default=None),
    # page는 최소 1이어야 한다. 0이나 음수면 FastAPI가 422를 반환한다.
    page: int = Query(default=1, ge=1),
    # size는 1~50까지만 허용한다. 너무 큰 요청으로 DB를 과하게 읽는 것을 막는다.
    size: int = Query(default=10, ge=1, le=50),
    # Depends(get_db)가 DB session을 만들어서 db 파라미터에 넣어준다.
    db: Session = Depends(get_db),
) -> PostListResponse:
    """
    공개 게시글 목록을 페이지 단위로 반환한다.

    Args:
        category: 선택된 게시글 카테고리 slug.
        keyword: 제목, 요약, 본문, 작성자, 태그 검색어.
        page: 현재 페이지 번호.
        size: 한 페이지에 가져올 게시글 개수.
        db: FastAPI가 주입한 SQLAlchemy session.

    Returns:
        게시글 목록, 전체 개수, 현재 페이지, 페이지 크기.
    """
    # router는 HTTP 요청을 해석한 뒤 service에 넘긴다.
    # 실제 DB 조회와 응답 조립은 service/repository 쪽 역할이다.
    return post_service.get_posts(
        db=db,
        category=category,
        keyword=keyword,
        page=page,
        size=size,
    )


# GET /posts/{post_id} endpoint다.
# {post_id}는 URL path에서 숫자 id를 받는 자리다. 예: /posts/1
@router.get("/{post_id}", response_model=PostDetailResponse)
def get_post_detail(
    # FastAPI가 URL의 {post_id} 값을 int로 변환해준다.
    post_id: int,
    # 게시글 상세 조회도 DB가 필요하므로 session을 주입받는다.
    db: Session = Depends(get_db),
) -> PostDetailResponse:
    """
    공개 게시글 상세를 반환한다.

    Args:
        post_id: 조회할 게시글 id.
        db: FastAPI가 주입한 SQLAlchemy session.

    Returns:
        게시글 상세 응답.

    Raises:
        HTTPException: 해당 id의 공개 게시글이 없으면 404를 반환한다.
    """

    # service에 상세 조회를 맡긴다.
    # 게시글이 없으면 service는 None을 반환하도록 만들었다.
    post = post_service.get_post_detail(db=db, post_id=post_id)

    # None이면 프론트에 "없는 게시글"이라고 알려야 하므로 404를 반환한다.
    if post is None:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")

    # 게시글이 있으면 Pydantic schema 객체를 그대로 반환한다.
    # FastAPI가 이 객체를 JSON으로 바꿔준다.
    return post
