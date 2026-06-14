"""게시글 라우터 연습 대상.

세션 08, 09에서 구현할 것:
- `GET /posts`
- `POST /posts`
- `GET /posts/{post_id}`
- `PATCH /posts/{post_id}`
- `DELETE /posts/{post_id}`
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import User
from app.schemas.post import PostCreate, PostListResponse, PostResponse, PostUpdate
from app.services.auth_service import get_current_user, get_optional_current_user
from app.services.post_service import (
    create_post,
    delete_post,
    get_post_by_id,
    list_posts,
    post_to_response,
    update_post,
)

router = APIRouter()


# 게시판 메인 목록 API다.
# query string으로 검색/필터/페이징 값을 받고, 로그인 사용자가 있으면 is_owner 계산에 사용한다.
@router.get(
    "",
    response_model=PostListResponse,
)
def read_posts(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=50),
    keyword: str | None = Query(default=None),
    post_type: str | None = Query(default=None),
    tag: str | None = Query(default=None),
    tags: list[str] | None = Query(default=None),
    slime_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
) -> PostListResponse:
    current_user_id = current_user.id if current_user is not None else None

    return list_posts(
        db=db,
        page=page,
        size=size,
        keyword=keyword,
        post_type=post_type,
        tag=tag,
        tags=tags,
        slime_type=slime_type,
        current_user_id=current_user_id,
    )

# 글쓰기 API다.
# 로그인한 사용자만 새 게시글을 만들 수 있고, 작성자는 access token의 current_user에서 가져온다.
@router.post(
    "",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_post_endpoint(
    post_data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostResponse:
    post = create_post(
        db=db,
        post_data=post_data,
        author_id=current_user.id,
    )

    return post_to_response(post, current_user_id=current_user.id)


# 게시글 수정 API다.
# 글이 없으면 404, 작성자가 아니면 403, 작성자이면 들어온 필드만 수정한다.
@router.patch(
    "/{post_id}",
    response_model=PostResponse,
)
def update_post_endpoint(
    post_id: int,
    post_data: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostResponse:
    post = get_post_by_id(db, post_id)

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    updated_post = update_post(
        db=db,
        post=post,
        post_data=post_data,
    )

    return post_to_response(updated_post, current_user_id=current_user.id)


# 게시글 삭제 API다.
# 글이 없으면 404, 작성자가 아니면 403, 작성자이면 삭제 후 204를 반환한다.
@router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_post_endpoint(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    post = get_post_by_id(db, post_id)

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    delete_post(db, post)

# 게시글 상세 API다.
# path parameter post_id로 글 하나를 찾고, 없으면 FastAPI 예외로 404 응답을 만든다.
@router.get(
    "/{post_id}",
    response_model=PostResponse,
)
def read_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
) -> PostResponse:
    post = get_post_by_id(db, post_id)

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    current_user_id = current_user.id if current_user is not None else None

    return post_to_response(post, current_user_id=current_user_id)
