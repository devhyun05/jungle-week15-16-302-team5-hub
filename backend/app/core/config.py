from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "JungleLog API"
    backend_cors_origins: str = "http://localhost:5173"
    frontend_url: str = "http://localhost:5173"
    database_url: str = "postgresql+psycopg://junglelog:junglelog@localhost:5432/junglelog"
    admin_emails: str = ""
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/auth/google/callback"
    jwt_secret_key: str = "change-me-in-local-env-before-real-login"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 14
    auth_access_cookie_name: str = "junglelog_access_token"
    auth_refresh_cookie_name: str = "junglelog_refresh_token"
    oauth_state_cookie_name: str = "junglelog_oauth_state"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"
    upload_dir: str = "uploads"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
