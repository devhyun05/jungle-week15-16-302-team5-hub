from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.admin import (
    AdminCommentResponse,
    AdminModerationResponse,
    AdminPostResponse,
    ModerationRequest,
)
from app.services.admin_service import (
    hide_comment,
    hide_post,
    list_admin_comments,
    list_admin_posts,
    restore_comment,
    restore_post,
)


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/health")
def admin_health(
    current_user: User = Depends(require_admin),
):
    return {
        "status": "ok",
        "admin_user_id": current_user.id,
    }


@router.get("/posts", response_model=list[AdminPostResponse])
def list_admin_posts_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return list_admin_posts(db)


@router.get("/comments", response_model=list[AdminCommentResponse])
def list_admin_comments_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return list_admin_comments(db)


@router.post("/posts/{post_id}/hide", response_model=AdminModerationResponse)
def hide_post_endpoint(
    post_id: int,
    request: ModerationRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return hide_post(db, post_id, request, current_user)


@router.post("/posts/{post_id}/restore", response_model=AdminModerationResponse)
def restore_post_endpoint(
    post_id: int,
    request: ModerationRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return restore_post(db, post_id, request, current_user)


@router.post("/comments/{comment_id}/hide", response_model=AdminModerationResponse)
def hide_comment_endpoint(
    comment_id: int,
    request: ModerationRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return hide_comment(db, comment_id, request, current_user)


@router.post("/comments/{comment_id}/restore", response_model=AdminModerationResponse)
def restore_comment_endpoint(
    comment_id: int,
    request: ModerationRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return restore_comment(db, comment_id, request, current_user)
