from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.models.post import Post


def list_comments(db: Session, post_id: int) -> list[Comment]:
    statement = (
        select(Comment)
        .where(
            Comment.post_id == post_id,
            Comment.deleted_at.is_(None),
        )
        .order_by(Comment.created_at.asc())
    )
    return list(db.scalars(statement))


def get_comment(db: Session, comment_id: int) -> Comment | None:
    statement = select(Comment).where(
        Comment.id == comment_id,
        Comment.deleted_at.is_(None),
    )
    return db.scalar(statement)


def create_comment(db: Session, comment: Comment, post: Post) -> Comment:
    db.add(comment)
    post.comment_count += 1
    db.commit()
    db.refresh(comment)
    return comment


def delete_comment(db: Session, comment: Comment, post: Post) -> None:
    comment.deleted_at = datetime.now(UTC)
    post.comment_count = max(0, post.comment_count - 1)
    db.commit()
