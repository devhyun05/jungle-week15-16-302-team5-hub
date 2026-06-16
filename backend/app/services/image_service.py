from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.post_image import PostImage
from app.models.user import User
from app.repositories import image_repository
from app.schemas.image import PostImageCreate
from app.services import post_service, s3_service


def create_presigned_url(file_name: str, content_type: str) -> dict[str, str]:
    return s3_service.create_presigned_upload_url(
        file_name=file_name,
        content_type=content_type,
    )


def create_post_image(
    db: Session,
    post_id: int,
    image_data: PostImageCreate,
    current_user: User,
) -> PostImage:
    post = post_service.find_post_or_404(db, post_id=post_id)
    post_service.check_post_owner(post, current_user)
    return image_repository.create_post_image(
        db,
        post_id=post.id,
        image_url=image_data.image_url,
        object_key=image_data.object_key,
        sort_order=image_data.sort_order,
    )


def delete_post_image(
    db: Session,
    image_id: int,
    current_user: User,
) -> None:
    post_image = image_repository.get_post_image(db, image_id=image_id)
    if post_image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found.",
        )

    post = post_service.find_post_or_404(db, post_id=post_image.post_id)
    post_service.check_post_owner(post, current_user)
    s3_service.delete_s3_object(object_key=post_image.object_key)
    image_repository.delete_post_image(db, post_image=post_image)
