from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.admin_action_log import AdminActionLog
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.schemas.admin import AdminModerationResponse, ModerationRequest


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_reason(request: ModerationRequest | None) -> str | None:
    if request is None or request.reason is None:
        return None

    reason = request.reason.strip()
    return reason or None


def get_post_for_admin(db: Session, post_id: int) -> Post:
    post = db.query(Post).filter(Post.id == post_id).first()

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    return post


def get_comment_for_admin(db: Session, comment_id: int) -> Comment:
    comment = (
        db.query(Comment)
        .filter(
            Comment.id == comment_id,
            Comment.deleted_at.is_(None),
        )
        .first()
    )

    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found",
        )

    return comment


def log_admin_action(
    db: Session,
    *,
    current_user: User,
    action: str,
    target_type: str,
    target_id: int,
    reason: str | None,
) -> None:
    db.add(
        AdminActionLog(
            actor_id=current_user.id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            reason=reason,
        )
    )


def moderation_response(
    *,
    target_type: str,
    target_id: int,
    hidden_at: datetime | None,
    hidden_by_id: int | None,
    hidden_reason: str | None,
) -> AdminModerationResponse:
    return AdminModerationResponse(
        target_type=target_type,
        target_id=target_id,
        hidden_at=hidden_at,
        hidden_by_id=hidden_by_id,
        hidden_reason=hidden_reason,
    )


def hide_post(
    db: Session,
    post_id: int,
    request: ModerationRequest | None,
    current_user: User,
) -> AdminModerationResponse:
    post = get_post_for_admin(db, post_id)
    reason = normalize_reason(request)

    post.hidden_at = utc_now()
    post.hidden_by_id = current_user.id
    post.hidden_reason = reason
    log_admin_action(
        db,
        current_user=current_user,
        action="hide",
        target_type="post",
        target_id=post.id,
        reason=reason,
    )

    db.commit()
    db.refresh(post)

    return moderation_response(
        target_type="post",
        target_id=post.id,
        hidden_at=post.hidden_at,
        hidden_by_id=post.hidden_by_id,
        hidden_reason=post.hidden_reason,
    )


def restore_post(
    db: Session,
    post_id: int,
    request: ModerationRequest | None,
    current_user: User,
) -> AdminModerationResponse:
    post = get_post_for_admin(db, post_id)
    reason = normalize_reason(request)

    post.hidden_at = None
    post.hidden_by_id = None
    post.hidden_reason = None
    log_admin_action(
        db,
        current_user=current_user,
        action="restore",
        target_type="post",
        target_id=post.id,
        reason=reason,
    )

    db.commit()
    db.refresh(post)

    return moderation_response(
        target_type="post",
        target_id=post.id,
        hidden_at=post.hidden_at,
        hidden_by_id=post.hidden_by_id,
        hidden_reason=post.hidden_reason,
    )


def hide_comment(
    db: Session,
    comment_id: int,
    request: ModerationRequest | None,
    current_user: User,
) -> AdminModerationResponse:
    comment = get_comment_for_admin(db, comment_id)
    reason = normalize_reason(request)

    comment.hidden_at = utc_now()
    comment.hidden_by_id = current_user.id
    comment.hidden_reason = reason
    log_admin_action(
        db,
        current_user=current_user,
        action="hide",
        target_type="comment",
        target_id=comment.id,
        reason=reason,
    )

    db.commit()
    db.refresh(comment)

    return moderation_response(
        target_type="comment",
        target_id=comment.id,
        hidden_at=comment.hidden_at,
        hidden_by_id=comment.hidden_by_id,
        hidden_reason=comment.hidden_reason,
    )


def restore_comment(
    db: Session,
    comment_id: int,
    request: ModerationRequest | None,
    current_user: User,
) -> AdminModerationResponse:
    comment = get_comment_for_admin(db, comment_id)
    reason = normalize_reason(request)

    comment.hidden_at = None
    comment.hidden_by_id = None
    comment.hidden_reason = None
    log_admin_action(
        db,
        current_user=current_user,
        action="restore",
        target_type="comment",
        target_id=comment.id,
        reason=reason,
    )

    db.commit()
    db.refresh(comment)

    return moderation_response(
        target_type="comment",
        target_id=comment.id,
        hidden_at=comment.hidden_at,
        hidden_by_id=comment.hidden_by_id,
        hidden_reason=comment.hidden_reason,
    )
