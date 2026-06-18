# BaseModel은 API request/response JSON 모양을 정의하는 Pydantic 기본 클래스다.
# ConfigDict는 alias 설정처럼 schema 공통 옵션을 줄 때 사용한다.
# Field는 Python 변수명과 JSON 필드명이 다를 때 alias를 붙이기 위해 사용한다.
from pydantic import BaseModel, ConfigDict, Field


class FrontendResponseModel(BaseModel):
    # 프론트엔드는 camelCase를 쓰고, 백엔드 Python 코드는 snake_case를 쓴다.
    # populate_by_name=True를 켜면 Python 이름과 alias 이름을 둘 다 사용할 수 있다.
    model_config = ConfigDict(populate_by_name=True)


class CurrentUserResponse(FrontendResponseModel):
    """
    /auth/me API가 프론트엔드에 돌려줄 현재 로그인 사용자 응답이다.

    DB users 테이블에는 profile_image_url처럼 snake_case로 저장하지만,
    React 화면에서는 profileImageUrl처럼 camelCase로 받는 편이 자연스럽다.
    그래서 Field(alias=...)로 API 응답 이름을 화면 친화적으로 바꾼다.
    """

    id: int
    email: str
    name: str
    profile_image_url: str | None = Field(default=None, alias="profileImageUrl")
    role: str
    approval_status: str = Field(alias="approvalStatus")
