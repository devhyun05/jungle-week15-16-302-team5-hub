"""애플리케이션 설정 연습 대상.

세션 01에서 구현할 것:
- `BaseSettings`
- `.env` 읽기
- `database_url`
- JWT 설정
- CORS 허용 출처

해당 세션을 시작하기 전까지는 이 파일을 최소 상태로 둔다.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str="sqlite:///./board_db.db"
    jwt_secret_key: str="dev-secret-change-me"
    jwt_algorithm: str="HS512"
    access_token_expire_minutes: int=15
    refresh_token_expire_days: int=14
    refresh_token_cookie_name: str="dev-secret-change-me"
    refresh_token_cookie_secure: bool=False
    cors_origins: list[str]=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

@lru_cache()
def get_settings() -> Settings:
    return Settings()