from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FrontendResponseModel(BaseModel):
    # Python 내부 필드명과 프론트 JSON 필드명을 둘 다 쓸 수 있게 한다.
    model_config = ConfigDict(populate_by_name=True)


class CommentCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class CommentItemResponse(FrontendResponseModel):
    id: int
    post_id: int = Field(alias="postId")
    author: str
    author_id: int = Field(alias="authorId")
    author_role: str = Field(alias="authorRole")
    content: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class CommentListResponse(FrontendResponseModel):
    post_id: int = Field(alias="postId")
    items: list[CommentItemResponse]
    total: int
