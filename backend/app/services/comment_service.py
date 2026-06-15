from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.comment import Comment, utc_now
from app.models.user import User
from app.schemas.comment import CommentCreateRequest, CommentUpdateRequest
from app.services.post_service import get_post


def list_comments_by_post(
    db: Session,
    post_id: int,
) -> list[Comment]:
    get_post(db, post_id)

    return (
        db.query(Comment)
        .filter(
            Comment.post_id == post_id,
            Comment.deleted_at.is_(None),
        )
        .order_by(Comment.created_at.asc())
        .all()
    )


def create_comment(
    db: Session,
    post_id: int,
    comment_request: CommentCreateRequest,
    current_user: User,
) -> Comment:
    get_post(db, post_id)

    comment = Comment(
        post_id=post_id,
        author_id=current_user.id,
        body=comment_request.body,
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment


def get_comment(
    db: Session,
    comment_id: int,
) -> Comment:
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


def update_comment(
    db: Session,
    comment_id: int,
    update_request: CommentUpdateRequest,
    current_user: User,
) -> Comment:
    comment = get_comment(db, comment_id)

    if comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to update this comment",
        )

    comment.body = update_request.body

    db.commit()
    db.refresh(comment)

    return comment


def delete_comment(
    db: Session,
    comment_id: int,
    current_user: User,
) -> None:
    comment = get_comment(db, comment_id)

    if comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to delete this comment",
        )

    comment.deleted_at = utc_now()

    db.commit()
