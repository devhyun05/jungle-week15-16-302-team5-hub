from datetime import UTC, datetime

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.post import Post


def list_posts(
    db: Session,
    *,
    keyword: str | None = None,
    status: str | None = None,
    sort: str = "latest",
    offset: int = 0,
    limit: int = 20,
) -> list[Post]:
    statement = select(Post).where(Post.deleted_at.is_(None))

    if keyword:
        search_word = f"%{keyword.strip()}%"
        statement = statement.where(
            or_(
                Post.title.ilike(search_word),
                Post.description.ilike(search_word),
            )
        )

    if status:
        statement = statement.where(Post.status == status)

    if sort == "popular":
        statement = statement.order_by(Post.view_count.desc(), Post.created_at.desc())
    elif sort == "price_low":
        statement = statement.order_by(Post.price.asc(), Post.created_at.desc())
    else:
        statement = statement.order_by(Post.created_at.desc())

    return list(db.scalars(statement.offset(offset).limit(limit)))


def get_post(db: Session, *, post_id: int) -> Post | None:
    statement = select(Post).where(
        Post.id == post_id,
        Post.deleted_at.is_(None),
    )
    return db.scalar(statement)


def create_post(db: Session, *, post: Post) -> Post:
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def update_post(db: Session, *, post: Post, values: dict) -> Post:
    for key, value in values.items():
        setattr(post, key, value)

    db.commit()
    db.refresh(post)
    return post


def delete_post(db: Session, *, post: Post) -> None:
    post.deleted_at = datetime.now(UTC)
    db.commit()


def increase_view_count(db: Session, *, post: Post) -> Post:
    post.view_count += 1
    db.commit()
    db.refresh(post)
    return post
