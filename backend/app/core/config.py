"""애플리케이션 설정 연습 대상.

세션 01에서 구현할 것:
- `BaseSettings`
- `.env` 읽기
- `database_url`
- JWT 설정
- CORS 허용 출처

해당 세션을 시작하기 전까지는 이 파일을 최소 상태로 둔다.
"""
import json
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://frontend-yeoseojin-s-projects.vercel.app",
    "https://frontend-lo20qv338-yeoseojin-s-projects.vercel.app",
]


def parse_cors_origins(raw_origins: str | None) -> list[str]:
    if raw_origins is None or not raw_origins.strip():
        return DEFAULT_CORS_ORIGINS

    raw_origins = raw_origins.strip()

    if raw_origins.startswith("["):
        parsed_origins = json.loads(raw_origins)
        if isinstance(parsed_origins, list):
            return [str(origin).strip() for origin in parsed_origins if str(origin).strip()]

    return [
        origin.strip()
        for origin in raw_origins.split(",")
        if origin.strip()
    ]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str
    access_token_expire_minutes: int=15
    llm_api_key: str | None = None
    refresh_token_expire_days: int=14
    refresh_token_cookie_name: str="refresh_token"
    refresh_token_cookie_secure: bool=False
    refresh_token_cookie_samesite: str="lax"
    cors_origins_raw: str | None = Field(default=None, validation_alias="CORS_ORIGINS")

    @property
    def cors_origins(self) -> list[str]:
        return parse_cors_origins(self.cors_origins_raw)

@lru_cache()
def get_settings() -> Settings:
    return Settings()
