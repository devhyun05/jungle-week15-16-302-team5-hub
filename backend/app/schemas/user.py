from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.post import PostResponse


class UserMe(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    username: str
    profile_image_url: str | None
    role: str
    created_at: datetime


class UserCommentResponse(BaseModel):
    id: int
    post_id: int
    post_title: str
    content: str
    is_secret: bool
    parent_comment_id: int | None
    created_at: datetime


class UserPostSummary(BaseModel):
    posts: list[PostResponse]
    total_count: int
    selling_count: int
    reserved_count: int
    sold_count: int
