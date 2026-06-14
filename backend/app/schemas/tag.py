"""태그 스키마 연습 대상.

세션 06에서 태그 목록과 인기 태그 응답 스키마를 구현한다.
"""

from pydantic import BaseModel, ConfigDict


# 태그 하나를 프론트에 내려줄 기본 응답 모양이다.
# DB의 Tag 객체를 JSON 응답으로 바꿀 때 사용한다.
class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    tag_type: str


# /tags 응답 전체 모양이다.
# 프론트는 items 안의 배열을 꺼내 태그 버튼 목록으로 보여준다.
class TagListResponse(BaseModel):
    items: list[TagResponse]


# 인기 태그 하나를 프론트에 내려줄 응답 모양이다.
# 기본 태그 정보에 post_tags 사용 횟수 count가 추가된다.
class PopularTagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    tag_type: str
    count: int


# /tags/popular 응답 전체 모양이다.
# 프론트는 items 안의 배열을 인기 태그 영역에 보여준다.
class PopularTagListResponse(BaseModel):
    items: list[PopularTagResponse]
