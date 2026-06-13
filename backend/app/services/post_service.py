from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.post import Post
from app.models.user import User
from app.repositories import post_repository
from app.schemas.post import PostCreate, PostSort, PostStatus, PostUpdate


def get_posts(
    db: Session,
    *,
    keyword: str | None,
    post_status: PostStatus | None,
    sort: PostSort,
    page: int,
    size: int,
) -> list[Post]:
    offset = (page - 1) * size
    return post_repository.list_posts(
        db,
        keyword=keyword,
        status=post_status,
        sort=sort,
        offset=offset,
        limit=size,
    )


def get_post_detail(db: Session, *, post_id: int) -> Post:
    post = find_post_or_404(db, post_id=post_id)
    return post_repository.increase_view_count(db, post=post)


def create_post(db: Session, *, post_data: PostCreate, seller: User) -> Post:
    post = Post(
        seller_id=seller.id,
        title=post_data.title,
        description=post_data.description,
        price=post_data.price,
        trade_location=post_data.trade_location,
        status=post_data.status,
    )
    return post_repository.create_post(db, post=post)


def update_post(
    db: Session,
    *,
    post_id: int,
    post_data: PostUpdate,
    current_user: User,
) -> Post:
    post = find_post_or_404(db, post_id=post_id)
    check_post_owner(post, current_user)

    values = post_data.model_dump(exclude_unset=True)
    if not values:
        return post

    return post_repository.update_post(db, post=post, values=values)


def update_post_status(
    db: Session,
    *,
    post_id: int,
    post_status: PostStatus,
    current_user: User,
) -> Post:
    post = find_post_or_404(db, post_id=post_id)
    check_post_owner(post, current_user)
    return post_repository.update_post(db, post=post, values={"status": post_status})


def delete_post(db: Session, *, post_id: int, current_user: User) -> None:
    post = find_post_or_404(db, post_id=post_id)
    check_post_owner(post, current_user)
    post_repository.delete_post(db, post=post)


def find_post_or_404(db: Session, *, post_id: int) -> Post:
    post = post_repository.get_post(db, post_id=post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found.",
        )
    return post


def check_post_owner(post: Post, current_user: User) -> None:
    if post.seller_id == current_user.id or current_user.role == "admin":
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to edit this post.",
    )
