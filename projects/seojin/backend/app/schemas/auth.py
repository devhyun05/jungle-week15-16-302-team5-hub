"""인증 스키마 연습 대상.

세션 02에서 `api-spec.md` 기준으로 회원가입/로그인 요청 스키마와
사용자/토큰 응답 스키마를 구현한다.

BaseModel: JSON 모양을 만드는 기본 클래스
EmailStr: 이메일 형식 검사
Field: 길이 같은 검증 조건
ConfigDict(from_attributes=True): SQLAlchemy 모델 객체를 응답 스키마로 바꿀 수 있게 함
"""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# 회원가입 요청 스키마
class SignupRequest(BaseModel):
    email: EmailStr = Field(
        ...,
        min_length=5,
        max_length=255,
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
    )
    nickname: str = Field(
        ...,
        min_length=1,
        max_length=80,
    )

class LoginRequest(BaseModel):  # 로그인 요청 스키마
    email: EmailStr
    password: str

class UserResponse(BaseModel):  # Pydantic 응답 스키마의 기본 클래스
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    nickname: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str="bearer"
    expires_in: int
    user: UserResponse
