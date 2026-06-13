from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FrontendResponseModel(BaseModel):
    # Python 코드에서는 snake_case를 쓰고,
    # JSON 응답에서는 postId, authorRole 같은 프론트 친화적인 이름을 쓰기 위해 설정한다.
    model_config = ConfigDict(populate_by_name=True)


class CommentItemResponse(FrontendResponseModel):
    # 댓글 고유 id
    id: int

    # 댓글이 달린 게시글 id
    # Python에서는 post_id, JSON에서는 postId로 내려간다.
    post_id: int = Field(alias="postId")

    # 댓글 작성자 이름
    # DB에서는 comments.author_id -> users.name 관계로 가져온다.
    author: str
    
    # 댓글 작성자 역할
    # 예: STUDENT, COACH, ADMIN
    author_role: str = Field(alias="authorRole")

    # 댓글 본문
    content: str

    # 댓글 작성 시각
    created_at: datetime = Field(alias="createdAt")

    # 댓글 수정 시각
    updated_at: datetime = Field(alias="updatedAt")


class CommentListResponse(FrontendResponseModel):
    # 어떤 게시글의 댓글 목록인지 알려준다.
    post_id: int = Field(alias="postId")

    # 댓글 목록 배열
    items: list[CommentItemResponse]

    # 댓글 총 개수
    total: int
