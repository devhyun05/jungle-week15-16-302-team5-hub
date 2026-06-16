from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.schemas.user import MyActivityResponse
from app.services.visibility import (
    apply_public_comment_visibility,
    apply_public_post_visibility,
)


def get_my_activity(
    db: Session,
    current_user: User,
) -> MyActivityResponse:
    posts = (
        apply_public_post_visibility(db.query(Post))
        .filter(Post.author_id == current_user.id)
        .order_by(Post.created_at.desc())
        .all()
    )

    comments_query = (
        db.query(Comment)
        .join(Post, Comment.post_id == Post.id)
        .filter(Comment.author_id == current_user.id)
    )
    comments = (
        apply_public_post_visibility(
            apply_public_comment_visibility(comments_query)
        )
        .order_by(Comment.created_at.desc())
        .all()
    )

    return MyActivityResponse(
        user=current_user,
        posts=posts,
        comments=comments,
    )
