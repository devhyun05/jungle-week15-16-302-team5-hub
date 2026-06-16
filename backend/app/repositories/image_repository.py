from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.post_image import PostImage


def create_post_image(
    db: Session,
    post_id: int,
    image_url: str,
    object_key: str,
    sort_order: int,
) -> PostImage:
    post_image = PostImage(
        post_id=post_id,
        image_url=image_url,
        object_key=object_key,
        sort_order=sort_order,
    )
    db.add(post_image)
    db.commit()
    db.refresh(post_image)
    return post_image


def get_post_image(db: Session, image_id: int) -> PostImage | None:
    statement = select(PostImage).where(PostImage.id == image_id)
    return db.scalar(statement)


def delete_post_image(db: Session, post_image: PostImage) -> None:
    db.delete(post_image)
    db.commit()
