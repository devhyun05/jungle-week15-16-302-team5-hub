from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Jungle Market API"
    api_prefix: str = "/api"
    frontend_url: str = "http://localhost:5173"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/jungle_market"

    slack_client_id: str = ""
    slack_client_secret: str = ""
    slack_redirect_uri: str = "http://localhost:8000/api/auth/slack/callback"
    allowed_slack_team_id: str = ""
    allowed_email_csv_path: str = ""
    slack_bot_token: str = ""

    jwt_secret_key: str = Field(default="", min_length=1)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 14

    access_token_cookie_name: str = "access_token"
    refresh_token_cookie_name: str = "refresh_token"
    oauth_state_cookie_name: str = "slack_oauth_state"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"

    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "ap-northeast-2"
    s3_bucket_name: str = ""
    s3_public_base_url: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
