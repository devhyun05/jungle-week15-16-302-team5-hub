from pydantic import BaseModel

from app.schemas.user import UserMe


class AuthResponse(BaseModel):
    user: UserMe


class TokenRefreshResponse(BaseModel):
    message: str
