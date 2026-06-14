"""댓글 스키마 연습 대상.

세션 10에서 댓글 요청/응답 스키마를 구현한다.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# 댓글 생성 요청 body 모양이다.
# 프론트가 POST /posts/{post_id}/comments로 content만 보낸다.
class CommentCreate(BaseModel):
    content: str = Field(
        ...,
        min_length=1,
    )


# 댓글 수정 요청 body 모양이다.
# PATCH /comments/{comment_id}에서 새 content를 받는다.
class CommentUpdate(BaseModel):
    content: str = Field(
        ...,
        min_length=1,
    )


# 댓글 응답 안에 들어가는 작성자 정보다.
# auth.py의 UserResponse, post.py의 PostAuthorResponse와 같은 모양이다.
class CommentAuthorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    nickname: str
    created_at: datetime


# 댓글 하나를 프론트에 내려줄 응답 모양이다.
# DB Comment 객체 자체가 아니라 author와 is_owner 계산값까지 포함한다.
class CommentResponse(BaseModel):
    id: int
    post_id: int
    content: str
    author: CommentAuthorResponse
    is_owner: bool
    created_at: datetime
    updated_at: datetime


# GET /posts/{post_id}/comments 응답 전체 모양이다.
# 프론트는 items 배열을 꺼내 댓글 목록으로 렌더링한다.
class CommentListResponse(BaseModel):
    items: list[CommentResponse]
