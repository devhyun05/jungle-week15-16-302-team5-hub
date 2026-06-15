from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.tag import TagResponse


class ModerationRequest(BaseModel):
    reason: str | None = Field(default=None, max_length=255)


class AdminModerationResponse(BaseModel):
    target_type: str
    target_id: int
    hidden_at: datetime | None
    hidden_by_id: int | None
    hidden_reason: str | None


class AdminPostResponse(BaseModel):
    id: int
    author_id: int
    title: str
    body: str
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
    hidden_at: datetime | None
    hidden_by_id: int | None
    hidden_reason: str | None
    tags: list[TagResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class AdminCommentResponse(BaseModel):
    id: int
    post_id: int
    author_id: int
    body: str
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
    hidden_at: datetime | None
    hidden_by_id: int | None
    hidden_reason: str | None

    model_config = ConfigDict(from_attributes=True)
