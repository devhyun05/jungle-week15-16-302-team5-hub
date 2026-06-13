# API 응답에서 날짜/시간 타입을 표현하기 위해 datetime을 사용한다.
from datetime import datetime

# BaseModel은 Pydantic schema의 기본 클래스다.
# ConfigDict는 schema 설정을 정의할 때 사용한다.
# Field는 Python 변수명과 JSON 응답 필드명이 다를 때 alias를 붙이기 위해 사용한다.
from pydantic import BaseModel, ConfigDict, Field


class FrontendResponseModel(BaseModel):
    # populate_by_name=True를 켜두면 alias 이름과 Python 필드 이름을 둘 다 사용할 수 있다.
    # 예: category_slug로 값을 넣어도 응답은 categorySlug로 내려줄 수 있다.
    model_config = ConfigDict(populate_by_name=True)


class PostCreateRequest(FrontendResponseModel):
    # 게시글 작성 API의 request body다.
    # JWT/OAuth2 전 단계라 author_id는 프론트에서 받지 않는다.
    # 나중에는 JWT token에서 current user를 꺼내 author_id로 사용한다.
    title: str = Field(min_length=1, max_length=200)
    summary: str | None = Field(default=None, max_length=500)
    content: str = Field(min_length=1)
    category_slug: str = Field(alias="categorySlug", min_length=1, max_length=50)
    tags: list[str] = Field(default_factory=list, max_length=10)
    is_public: bool = Field(default=True, alias="isPublic")
    related_commit: str | None = Field(default=None, alias="relatedCommit", max_length=500)


class PostListItemResponse(FrontendResponseModel):
    # 게시글 고유 id다. 프론트에서 상세 페이지 /posts/:id로 이동할 때 쓴다.
    id: int
    # 게시글 제목이다. 목록 카드와 상세 화면의 제목으로 사용된다.
    title: str
    # 게시글 요약이다. DB에서 비어 있을 수 있으므로 None을 허용한다.
    summary: str | None
    # 화면에 보여줄 카테고리 이름이다. 예: 학습 로그
    category: str
    # Python에서는 category_slug로 다루고, JSON에서는 categorySlug로 내려준다.
    category_slug: str = Field(alias="categorySlug")
    # 게시글에 연결된 태그 이름 목록이다. 예: ["FastAPI", "JWT"]
    tags: list[str]
    # 작성자 표시 이름이다. DB에서는 posts.author_id -> users.name으로 가져온다.
    author: str
    # 작성자 역할이다. Python 이름은 author_role, JSON 이름은 authorRole이다.
    author_role: str = Field(alias="authorRole")
    # 공개 여부다. Python 이름은 is_public, JSON 이름은 isPublic이다.
    is_public: bool = Field(alias="isPublic")
    # 조회수다. DB 컬럼 view_count를 API에서는 views라는 화면 친화적 이름으로 내려준다.
    views: int
    # 댓글 개수다. comments 테이블을 count해서 만든 값이라 posts 테이블 컬럼은 아니다.
    comments: int
    # 생성 시각이다. Python 이름은 created_at, JSON 이름은 createdAt이다.
    created_at: datetime = Field(alias="createdAt")


class PostListResponse(FrontendResponseModel):
    # 실제 게시글 목록 배열이다.
    items: list[PostListItemResponse]
    # 필터 조건에 맞는 전체 게시글 개수다. 페이지 계산에 필요하다.
    total: int
    # 현재 페이지 번호다. 1부터 시작한다.
    page: int
    # 한 페이지에 몇 개를 보여줄지 나타낸다.
    size: int


class PostDetailResponse(PostListItemResponse):
    # 상세 화면에서만 필요한 본문이다. 목록 응답에는 보내지 않는다.
    content: str
    # 연결 커밋 정보다. Python 이름은 related_commit, JSON 이름은 relatedCommit이다.
    related_commit: str | None = Field(alias="relatedCommit")
    # 수정 시각이다. 상세 화면에서 마지막 수정 시간을 보여줄 때 쓴다.
    updated_at: datetime = Field(alias="updatedAt")
