from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CommentCreateRequest(BaseModel):
    body: str


class CommentUpdateRequest(BaseModel):
    body: str


class CommentResponse(BaseModel):
    id: int
    post_id: int
    author_id: int
    body: str
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None

    model_config = ConfigDict(from_attributes=True)