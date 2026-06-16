from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    database_url: str = "sqlite:///./glowboard.db"
    redis_url: str = "redis://localhost:6379/0"
    jwt_secret: str = "dev-only-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    refresh_session_absolute_days: int = 30
    refresh_cookie_name: str = "refresh_token"
    csrf_cookie_name: str = "csrf_token"
    csrf_cookie_path: str = "/"
    auth_cookie_path: str = "/api/auth"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"

    model_config = SettingsConfigDict(
        env_file=(".env", BACKEND_ENV_FILE),
        extra="ignore",
    )

settings = Settings()
