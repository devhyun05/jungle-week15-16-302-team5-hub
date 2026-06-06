from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """MCP server settings.

    TODO:
    - WEATHER_API_KEY를 환경 변수에서 읽는다.
    - DEFAULT_LOCATION을 관리한다.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    weather_api_key: str = ""
    default_location: str = "Seoul"


settings = Settings()
