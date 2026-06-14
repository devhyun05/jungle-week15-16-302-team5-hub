from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models import Comment, Post, User


DEMO_COMMENT_AUTHOR_EMAIL = "demo.student@junglelog.local"


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


def get_demo_comment_author(db: Session) -> User | None:
    """
    JWT/OAuth2 구현 전까지 댓글 작성에 사용할 임시 demo 사용자를 조회한다.

    실제 로그인 기능이 들어오면 이 함수는 current_user dependency로 대체된다.
    """

    return db.scalar(
        select(User).where(User.email == DEMO_COMMENT_AUTHOR_EMAIL)
    )


def create_comment(
    db: Session,
    post_id: int,
    author_id: int,
    content: str,
) -> Comment:
    """
    comments 테이블에 댓글 row를 새로 저장한다.

    Args:
        db: SQLAlchemy session.
        post_id: 댓글을 달 게시글 id.
        author_id: 댓글 작성자 users.id.
        content: 댓글 본문.

    Returns:
        DB에 저장되고 id/created_at이 채워진 Comment model.
    """

    comment = Comment(
        post_id=post_id,
        author_id=author_id,
        content=content,
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment


def get_comment_for_update(db: Session, comment_id: int) -> Comment | None:
    """
    삭제 또는 수정 대상 댓글을 id로 조회한다.

    이미 soft delete된 댓글은 다시 삭제할 대상이 아니므로 `deleted_at is null` 조건으로 제외한다.
    """

    return db.scalar(
        select(Comment)
        .options(selectinload(Comment.author))
        .where(
            Comment.id == comment_id,
            Comment.deleted_at.is_(None),
        )
    )


def soft_delete_comment(db: Session, comment: Comment) -> None:
    """
    댓글을 실제로 지우지 않고 deleted_at만 채워 삭제 처리한다.

    댓글 row를 바로 없애면 나중에 운영자가 삭제 이력을 확인하거나 복구하기 어렵다.
    그래서 게시글 삭제와 같은 방식으로 soft delete를 사용한다.
    """

    comment.deleted_at = datetime.now(timezone.utc)
    db.commit()
