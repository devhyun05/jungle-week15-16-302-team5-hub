from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.schemas.user import MyActivityResponse


def get_my_activity(
    db: Session,
    current_user: User,
) -> MyActivityResponse:
    posts = (
        db.query(Post)
        .filter(
            Post.author_id == current_user.id,
            Post.deleted_at.is_(None),
            Post.hidden_at.is_(None),
        )
        .order_by(Post.created_at.desc())
        .all()
    )

    comments = (
        db.query(Comment)
        .join(Post, Comment.post_id == Post.id)
        .filter(
            Comment.author_id == current_user.id,
            Comment.deleted_at.is_(None),
            Comment.hidden_at.is_(None),
            Post.deleted_at.is_(None),
            Post.hidden_at.is_(None),
        )
        .order_by(Comment.created_at.desc())
        .all()
    )

    return MyActivityResponse(
        user=current_user,
        posts=posts,
        comments=comments,
    )
