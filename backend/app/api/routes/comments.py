from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.comment import (
    CommentCreateRequest,
    CommentPageResponse,
    CommentResponse,
    CommentUpdateRequest,
)
from app.services.comment_service import (
    create_comment,
    delete_comment,
    list_comments_by_post,
    update_comment,
)
from app.services.rate_limit_service import check_rate_limit


router = APIRouter(prefix="/api", tags=["comments"])


@router.get(
    "/posts/{post_id}/comments",
    response_model=CommentPageResponse,
)
def list_comments_by_post_endpoint(
    post_id: int,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    return list_comments_by_post(db, post_id, page=page, size=size)


@router.post(
    "/posts/{post_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment_endpoint(
    post_id: int,
    comment_request: CommentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    check_rate_limit(
        key=f"rate:comments:create:{current_user.id}",
        limit=5,
        window_seconds=60,
    )

    return create_comment(db, post_id, comment_request, current_user)


@router.put(
    "/comments/{comment_id}",
    response_model=CommentResponse,
)
def update_comment_endpoint(
    comment_id: int,
    update_request: CommentUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_comment(db, comment_id, update_request, current_user)


@router.delete(
    "/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_comment_endpoint(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_comment(db, comment_id, current_user)
