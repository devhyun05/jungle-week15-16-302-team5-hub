from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.repositories import comment_repository, post_repository
from app.schemas.comment import CommentCreate, CommentResponse


def get_comments(
    db: Session,
    *,
    post_id: int,
    current_user: User | None,
) -> list[CommentResponse]:
    post = post_repository.get_post(db, post_id=post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found.",
        )

    comments = comment_repository.list_comments(db, post_id=post_id)
    return [
        to_comment_response(comment, post=post, current_user=current_user)
        for comment in comments
    ]


def create_comment(
    db: Session,
    *,
    post_id: int,
    comment_data: CommentCreate,
    writer: User,
) -> CommentResponse:
    post = post_repository.get_post(db, post_id=post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found.",
        )

    if comment_data.parent_comment_id is not None:
        parent = comment_repository.get_comment(
            db,
            comment_id=comment_data.parent_comment_id,
        )
        if parent is None or parent.post_id != post_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid parent comment.",
            )

    comment = Comment(
        post_id=post_id,
        writer_id=writer.id,
        parent_comment_id=comment_data.parent_comment_id,
        content=comment_data.content,
        is_secret=comment_data.is_secret,
    )
    created_comment = comment_repository.create_comment(db, comment=comment, post=post)
    return to_comment_response(created_comment, post=post, current_user=writer)


def delete_comment(
    db: Session,
    *,
    post_id: int,
    comment_id: int,
    current_user: User,
) -> None:
    post = post_repository.get_post(db, post_id=post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found.",
        )

    comment = comment_repository.get_comment(db, comment_id=comment_id)
    if comment is None or comment.post_id != post_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found.",
        )

    if not can_delete_comment(comment, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this comment.",
        )

    comment_repository.delete_comment(db, comment=comment, post=post)


def to_comment_response(
    comment: Comment,
    *,
    post: Post,
    current_user: User | None,
) -> CommentResponse:
    can_view_secret = can_view_secret_comment(comment, post, current_user)
    is_hidden = comment.is_secret and not can_view_secret

    return CommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        writer_id=comment.writer_id,
        parent_comment_id=comment.parent_comment_id,
        content="비밀 댓글입니다." if is_hidden else comment.content,
        is_secret=comment.is_secret,
        is_hidden=is_hidden,
        can_delete=can_delete_comment(comment, current_user),
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


def can_view_secret_comment(
    comment: Comment,
    post: Post,
    current_user: User | None,
) -> bool:
    if not comment.is_secret:
        return True

    if current_user is None:
        return False

    return (
        current_user.id == comment.writer_id
        or current_user.id == post.seller_id
        or current_user.role == "admin"
    )


def can_delete_comment(comment: Comment, current_user: User | None) -> bool:
    if current_user is None:
        return False

    return current_user.id == comment.writer_id or current_user.role == "admin"
