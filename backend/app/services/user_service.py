from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.schemas.user import UserCommentResponse, UserPostSummary


def get_my_posts(db: Session, current_user: User) -> UserPostSummary:
    statement = (
        select(Post)
        .where(
            Post.seller_id == current_user.id,
            Post.deleted_at.is_(None),
        )
        .order_by(Post.created_at.desc())
    )
    posts = list(db.scalars(statement))

    return UserPostSummary(
        posts=posts,
        total_count=len(posts),
        selling_count=count_posts_by_status(posts, "selling"),
        reserved_count=count_posts_by_status(posts, "reserved"),
        sold_count=count_posts_by_status(posts, "sold"),
    )


def get_my_comments(db: Session, current_user: User) -> list[UserCommentResponse]:
    statement = (
        select(Comment, Post.title)
        .join(Post, Post.id == Comment.post_id)
        .where(
            Comment.writer_id == current_user.id,
            Comment.deleted_at.is_(None),
            Post.deleted_at.is_(None),
        )
        .order_by(Comment.created_at.desc())
    )

    return [
        UserCommentResponse(
            id=comment.id,
            post_id=comment.post_id,
            post_title=post_title,
            content=comment.content,
            is_secret=comment.is_secret,
            parent_comment_id=comment.parent_comment_id,
            created_at=comment.created_at,
        )
        for comment, post_title in db.execute(statement)
    ]


def count_posts_by_status(posts: list[Post], status: str) -> int:
    return sum(1 for post in posts if post.status == status)
