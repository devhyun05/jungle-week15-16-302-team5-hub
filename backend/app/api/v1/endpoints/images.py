from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.image import (
    PostImageCreate,
    PostImageResponse,
    PresignedUrlRequest,
    PresignedUrlResponse,
)
from app.services import image_service

router = APIRouter(tags=["images"])


@router.post("/images/presigned-url", response_model=PresignedUrlResponse)
def create_presigned_url(
    upload_data: PresignedUrlRequest,
    current_user: User = Depends(get_current_user),
) -> PresignedUrlResponse:
    return PresignedUrlResponse(
        **image_service.create_presigned_url(
            file_name=upload_data.file_name,
            content_type=upload_data.content_type,
        )
    )


@router.post(
    "/posts/{post_id}/images",
    response_model=PostImageResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_post_image(
    post_id: int,
    image_data: PostImageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostImageResponse:
    return image_service.create_post_image(
        db,
        post_id=post_id,
        image_data=image_data,
        current_user=current_user,
    )


@router.delete("/post-images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    image_service.delete_post_image(
        db,
        image_id=image_id,
        current_user=current_user,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
