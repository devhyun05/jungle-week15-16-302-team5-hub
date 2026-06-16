from pathlib import Path
from uuid import uuid4

import boto3
from botocore.client import Config
from fastapi import HTTPException, status

from app.core.config import get_settings

settings = get_settings()

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def create_presigned_upload_url(file_name: str, content_type: str) -> dict[str, str]:
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="지원하지 않는 이미지 형식입니다.",
        )

    if not settings.s3_bucket_name or not settings.s3_public_base_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="S3 설정이 필요합니다.",
        )

    extension = Path(file_name).suffix.lower() or ALLOWED_IMAGE_TYPES[content_type]
    if extension == ".jpeg":
        extension = ".jpg"

    if extension not in ALLOWED_IMAGE_TYPES.values():
        extension = ALLOWED_IMAGE_TYPES[content_type]

    object_key = f"posts/{uuid4()}{extension}"
    upload_url = get_s3_client().generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.s3_bucket_name,
            "Key": object_key,
            "ContentType": content_type,
        },
        ExpiresIn=300,
    )

    return {
        "upload_url": upload_url,
        "image_url": f"{settings.s3_public_base_url.rstrip('/')}/{object_key}",
        "object_key": object_key,
    }


def delete_s3_object(object_key: str) -> None:
    if not settings.s3_bucket_name:
        return

    get_s3_client().delete_object(
        Bucket=settings.s3_bucket_name,
        Key=object_key,
    )


def get_s3_client():
    return boto3.client(
        "s3",
        region_name=settings.aws_region,
        endpoint_url=f"https://s3.{settings.aws_region}.amazonaws.com",
        aws_access_key_id=settings.aws_access_key_id or None,
        aws_secret_access_key=settings.aws_secret_access_key or None,
        config=Config(signature_version="s3v4"),
    )
