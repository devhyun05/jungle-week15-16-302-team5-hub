from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.tag import TagResponse


class PostCreateRequest(BaseModel):
    title: str
    body: str
    tag_names: list[str] = Field(default_factory=list)


class PostUpdateRequest(BaseModel):
    title: str | None = None
    body: str | None = None
    tag_names: list[str] | None = None


class PostResponse(BaseModel):
    id: int
    author_id: int
    title: str
    body: str
    created_at: datetime
    updated_at: datetime
    tags: list[TagResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
