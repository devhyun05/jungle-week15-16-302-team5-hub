"""게시글 스키마 연습 대상.

세션 07에서 `api-spec.md`와 프론트 `Post` / `PostListResponse` 타입 기준으로
게시글 생성/수정/목록/상세 스키마를 구현한다.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


PostType = Literal["recipe", "failure", "review", "general"]


# 글쓰기 화면에서 백엔드로 보내는 요청 body 모양이다.
# title/content/post_type은 필수, slime_type/tag_names는 선택적으로 보낸다.
class PostCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )
    content: str = Field(
        ...,
        min_length=1,
    )
    post_type: PostType
    slime_type: str | None = Field(
        default=None,
        max_length=80,
    )
    tag_names: list[str] = Field(
        default_factory=list,
        max_length=8,
    )


# 수정 화면에서 보내는 요청 body 모양이다.
# partial update이므로 모든 필드가 선택 사항이다.
class PostUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )
    content: str | None = Field(
        default=None,
        min_length=1,
    )
    post_type: PostType | None = None
    slime_type: str | None = Field(
        default=None,
        max_length=80,
    )
    tag_names: list[str] | None = Field(
        default=None,
        max_length=8,
    )


# 게시글 응답 안에 들어갈 작성자 정보다.
# auth.py의 UserResponse와 같은 모양으로 맞춘다.
class PostAuthorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    nickname: str
    created_at: datetime


# 목록/상세에서 게시글 하나를 내려줄 응답 모양이다.
# DB Post 객체 그대로가 아니라 프론트가 바로 쓰기 쉬운 값까지 포함한다.
class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    summary: str
    post_type: PostType
    slime_type: str | None
    tags: list[str]
    author: PostAuthorResponse
    comment_count: int
    is_owner: bool
    created_at: datetime
    updated_at: datetime


# GET /posts 목록 응답 전체 모양이다.
# items와 페이지 정보를 함께 내려준다.
class PostListResponse(BaseModel):
    items: list[PostResponse]
    page: int
    size: int
    total: int
    total_pages: int
