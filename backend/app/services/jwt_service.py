from datetime import UTC, datetime, timedelta

from app.core.config import get_settings
from app.core.security import create_token, decode_token

settings = get_settings()


def create_access_token(user_id: int, role: str) -> str:
    return create_token(
        subject=str(user_id),
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        token_type="access",
        extra_claims={"role": role},
    )


def create_refresh_token(user_id: int) -> str:
    return create_token(
        subject=str(user_id),
        expires_delta=timedelta(days=settings.refresh_token_expire_days),
        token_type="refresh",
    )


def decode_access_token(token: str) -> dict:
    return decode_token(token, expected_type="access")


def decode_refresh_token(token: str) -> dict:
    return decode_token(token, expected_type="refresh")


def get_refresh_token_expires_at() -> datetime:
    return datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
