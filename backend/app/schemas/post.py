from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PostCreateRequest(BaseModel):
    title: str
    body: str


class PostUpdateRequest(BaseModel):
    title: str | None = None
    body: str | None = None


class PostResponse(BaseModel):
    id: int
    author_id: int
    title: str
    body: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
