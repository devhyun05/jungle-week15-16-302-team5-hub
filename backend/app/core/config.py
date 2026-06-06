from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    TODO:
    - DATABASE_URL, JWT_SECRET_KEY, LLM_API_KEY, MCP_SERVER_URL을 관리한다.
    - .env 파일을 로컬 개발에서만 사용하고 GitHub에는 올리지 않는다.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql+psycopg://localhost:5432/malang_lab"
    jwt_secret_key: str = ""
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    llm_api_key: str = ""
    mcp_server_url: str = "http://localhost:8001/jsonrpc"


settings = Settings()
