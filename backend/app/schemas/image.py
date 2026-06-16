from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PresignedUrlRequest(BaseModel):
    file_name: str = Field(min_length=1, max_length=255)
    content_type: str = Field(min_length=1, max_length=100)


class PresignedUrlResponse(BaseModel):
    upload_url: str
    image_url: str
    object_key: str


class PostImageCreate(BaseModel):
    image_url: str = Field(min_length=1)
    object_key: str = Field(min_length=1)
    sort_order: int = Field(default=0, ge=0)


class PostImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    post_id: int
    image_url: str
    object_key: str
    sort_order: int
    created_at: datetime
