from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

PostStatus = Literal["selling", "reserved", "sold"]
PostSort = Literal["latest", "popular", "price_low"]


class PostCreate(BaseModel):
    title: str = Field(min_length=2, max_length=80)
    description: str | None = Field(default=None, max_length=1000)
    price: int = Field(ge=0)
    trade_location: str = Field(min_length=1, max_length=40)
    status: PostStatus = "selling"

    @field_validator("title", "trade_location")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("빈 값은 사용할 수 없습니다.")
        return value

    @field_validator("description")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class PostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=80)
    description: str | None = Field(default=None, max_length=1000)
    price: int | None = Field(default=None, ge=0)
    trade_location: str | None = Field(default=None, min_length=1, max_length=40)
    status: PostStatus | None = None

    @field_validator("title", "trade_location")
    @classmethod
    def strip_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("빈 값은 사용할 수 없습니다.")
        return value

    @field_validator("description")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class PostStatusUpdate(BaseModel):
    status: PostStatus


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seller_id: int
    title: str
    description: str | None
    price: int
    trade_location: str
    status: PostStatus
    view_count: int
    like_count: int
    comment_count: int
    created_at: datetime
    updated_at: datetime
