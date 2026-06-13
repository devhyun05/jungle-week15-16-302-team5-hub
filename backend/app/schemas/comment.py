from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=1000)
    parent_comment_id: int | None = None
    is_secret: bool = False

    @field_validator("content")
    @classmethod
    def strip_content(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("댓글 내용을 입력해주세요.")
        return value


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    post_id: int
    writer_id: int
    parent_comment_id: int | None
    content: str
    is_secret: bool
    is_hidden: bool = False
    can_delete: bool = False
    created_at: datetime
    updated_at: datetime
