from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic import AliasChoices


class FrontendResponseModel(BaseModel):
    # Python 내부에서는 snake_case, 프론트 JSON에서는 camelCase를 쓰기 위한 공통 설정이다.
    model_config = ConfigDict(populate_by_name=True)


class PostCreateRequest(FrontendResponseModel):
    # 작성자는 request body로 받지 않는다. 로그인 사용자를 current_user로 꺼내 author_id에 저장한다.
    title: str = Field(min_length=1, max_length=200)
    summary: str | None = Field(default=None, max_length=500)
    content: str = Field(min_length=1)
    category_slug: str = Field(alias="categorySlug", min_length=1, max_length=50)
    tags: list[str] = Field(default_factory=list, max_length=10)
    is_public: bool = Field(default=True, alias="isPublic")
    related_github_url: str | None = Field(
        default=None,
        alias="relatedGitHubUrl",
        validation_alias=AliasChoices("relatedGitHubUrl", "relatedCommit"),
        max_length=500,
    )


class PostUpdateRequest(PostCreateRequest):
    # 현재 수정 화면은 제목/본문/카테고리/태그/공개 여부를 한 번에 다시 보내는 full-form PATCH 방식이다.
    pass


class PostListItemResponse(FrontendResponseModel):
    id: int
    title: str
    summary: str | None
    category: str
    category_slug: str = Field(alias="categorySlug")
    tags: list[str]
    author: str
    author_id: int = Field(alias="authorId")
    author_role: str = Field(alias="authorRole")
    author_profile_image_url: str | None = Field(default=None, alias="authorProfileImageUrl")
    is_public: bool = Field(alias="isPublic")
    views: int
    comments: int
    created_at: datetime = Field(alias="createdAt")


class PostListResponse(FrontendResponseModel):
    items: list[PostListItemResponse]
    total: int
    page: int
    size: int


class PostDetailResponse(PostListItemResponse):
    content: str
    related_github_url: str | None = Field(default=None, alias="relatedGitHubUrl")
    updated_at: datetime = Field(alias="updatedAt")
