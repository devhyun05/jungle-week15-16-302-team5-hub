from sqlalchemy.orm import Query, Session

from app.models.comment import Comment
from app.models.post import Post


def apply_public_post_visibility(query: Query) -> Query:
    return query.filter(
        Post.deleted_at.is_(None),
        Post.hidden_at.is_(None),
    )


def apply_public_comment_visibility(query: Query) -> Query:
    return query.filter(
        Comment.deleted_at.is_(None),
        Comment.hidden_at.is_(None),
    )


def public_posts_query(db: Session) -> Query:
    return apply_public_post_visibility(db.query(Post))


def public_comments_query(db: Session) -> Query:
    return apply_public_comment_visibility(db.query(Comment))
