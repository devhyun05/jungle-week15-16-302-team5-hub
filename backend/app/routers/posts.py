from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.dependencies.auth import get_current_approved_user, get_optional_current_user, require_roles
from app.schemas.post import PostCreateRequest, PostDetailResponse, PostListResponse, PostUpdateRequest
from app.services import post_service


router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=PostListResponse)
def get_posts(
    category: str | None = Query(default=None),
    keyword: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
) -> PostListResponse:
    """
    공개 게시글 목록을 페이지 단위로 반환한다.
    """

    return post_service.get_posts(
        db=db,
        category=category,
        keyword=keyword,
        page=page,
        size=size,
    )


@router.post("", response_model=PostDetailResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    request: PostCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> PostDetailResponse:
    """
    현재 로그인 사용자를 작성자로 사용해 게시글을 작성한다.

    코치는 기본적으로 학생 기록을 검토하는 역할이므로 글 작성 권한에서는 제외한다.
    """

    try:
        post = post_service.create_post(
            db=db,
            request=request,
            current_user=current_user,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if post is None:
        raise HTTPException(status_code=404, detail="카테고리를 찾을 수 없습니다.")

    return post


@router.patch("/{post_id}", response_model=PostDetailResponse)
def update_post(
    post_id: int,
    request: PostUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_approved_user),
) -> PostDetailResponse:
    """
    작성자 본인 또는 ADMIN만 게시글을 수정한다.
    """

    try:
        post = post_service.update_post(
            db=db,
            post_id=post_id,
            request=request,
            current_user=current_user,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except PermissionError as error:
        raise HTTPException(status_code=403, detail=str(error)) from error

    if post is None:
        raise HTTPException(status_code=404, detail="게시글 또는 카테고리를 찾을 수 없습니다.")

    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_approved_user),
) -> None:
    """
    작성자 본인 또는 ADMIN만 게시글을 soft delete 처리한다.
    """

    try:
        deleted = post_service.delete_post(
            db=db,
            post_id=post_id,
            current_user=current_user,
        )
    except PermissionError as error:
        raise HTTPException(status_code=403, detail=str(error)) from error

    if not deleted:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")


@router.get("/{post_id}", response_model=PostDetailResponse)
def get_post_detail(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
) -> PostDetailResponse:
    """
    게시글 상세를 반환한다.

    공개글은 비로그인 사용자도 볼 수 있고,
    비공개글은 optional current_user로 작성자 본인 또는 ADMIN만 볼 수 있게 한다.
    """

    post = post_service.get_post_detail(
        db=db,
        post_id=post_id,
        current_user=current_user,
    )

    if post is None:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")

    return post
