from datetime import UTC, datetime

from sqlalchemy import case, delete, or_, select, update
from sqlalchemy.orm import Session, selectinload

from app.models.post import Post
from app.models.post_like import PostLike


def list_posts(
    db: Session,
    keyword: str | None = None,
    status: str | None = None,
    category: str | None = None,
    sort: str = "latest",
    offset: int = 0,
    limit: int = 20,
) -> list[Post]:
    statement = select(Post).options(
        selectinload(Post.images),
        selectinload(Post.seller),
    )
    statement = statement.where(Post.deleted_at.is_(None))

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

    if category:
        statement = statement.where(Post.category == category)

    sort_columns = {
        "popular": [
            Post.like_count.desc(),
            Post.comment_count.desc(),
            Post.view_count.desc(),
            Post.created_at.desc(),
        ],
        "price_low": [
            Post.price.asc(),
            Post.created_at.desc(),
        ],
        "latest": [
            Post.created_at.desc(),
        ],
    }

    statement = statement.order_by(*sort_columns.get(sort, sort_columns["latest"]))
    statement = statement.offset(offset).limit(limit)

    return list(db.scalars(statement))


def get_post(db: Session, post_id: int) -> Post | None:
    statement = select(Post).options(
        selectinload(Post.images),
        selectinload(Post.seller),
    ).where(
        Post.id == post_id,
        Post.deleted_at.is_(None),
    )
    return db.scalar(statement)


def create_post(db: Session, post: Post) -> Post:
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def update_post(db: Session, post: Post, values: dict) -> Post:
    for key, value in values.items():
        setattr(post, key, value)

    db.commit()
    db.refresh(post)
    return post


def delete_post(db: Session, post: Post) -> None:
    post.deleted_at = datetime.now(UTC)
    db.commit()


def increase_view_count(db: Session, post: Post) -> Post:
    post.view_count += 1
    db.commit()
    db.refresh(post)
    return post


def get_post_like(db: Session, post_id: int, user_id: int) -> PostLike | None:
    statement = select(PostLike).where(
        PostLike.post_id == post_id,
        PostLike.user_id == user_id,
    )
    return db.scalar(statement)


def add_post_like(db: Session, post: Post, user_id: int) -> Post:
    db.add(PostLike(post_id=post.id, user_id=user_id))
    db.execute(
        update(Post)
        .where(Post.id == post.id)
        .values(like_count=Post.like_count + 1)
    )
    db.commit()
    db.refresh(post)
    return post


def remove_post_like(db: Session, post: Post, user_id: int) -> Post:
    db.execute(
        delete(PostLike).where(
            PostLike.post_id == post.id,
            PostLike.user_id == user_id,
        )
    )
    db.execute(
        update(Post)
        .where(Post.id == post.id)
        .values(
            like_count=case(
                (Post.like_count > 0, Post.like_count - 1),
                else_=0,
            )
        )
    )
    db.commit()
    db.refresh(post)
    return post
