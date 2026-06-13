from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models import Comment, Post


def get_public_post_exists(db: Session, post_id: int) -> bool:
    """
    댓글을 조회하기 전에 게시글이 실제로 존재하는지 확인한다.

    Args:
        db: SQLAlchemy session.
        post_id: 댓글을 조회할 게시글 id.

    Returns:
        공개 게시글이 존재하면 True, 없으면 False.
    """

    # SELECT posts.id FROM posts WHERE ...
    post = db.scalar(
        select(Post.id).where(
            Post.id == post_id,
            Post.deleted_at.is_(None),
            Post.is_public.is_(True),
        )
    )

    # post가 None이 아니면 존재한다는 뜻이다.
    return post is not None


def list_comments_by_post_id(db: Session, post_id: int) -> list[Comment]:
    """
    특정 게시글의 삭제되지 않은 댓글 목록을 조회한다.

    Args:
        db: SQLAlchemy session.
        post_id: 댓글을 조회할 게시글 id.

    Returns:
        Comment SQLAlchemy model 목록.
    """

    # 댓글 응답에는 작성자 이름과 역할이 필요하다.
    # 그래서 Comment.author 관계를 미리 로딩한다.
    comments = db.scalars(
        select(Comment)
        .options(selectinload(Comment.author))
        .where(
            Comment.post_id == post_id,
            Comment.deleted_at.is_(None),
        )
        .order_by(Comment.created_at.asc())
    )

    return list(comments)
