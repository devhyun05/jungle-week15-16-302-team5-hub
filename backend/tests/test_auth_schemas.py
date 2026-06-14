from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.models import RefreshToken, User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserResponse


def test_signup_request_validates_required_auth_fields() -> None:
    request = SignupRequest(
        email="slime@example.com",
        password="password123",
        nickname="말랑이",
    )

    assert request.email == "slime@example.com"
    assert request.password == "password123"
    assert request.nickname == "말랑이"


def test_signup_request_rejects_invalid_email_and_short_password() -> None:
    with pytest.raises(ValidationError):
        SignupRequest(
            email="bad",
            password="short",
            nickname="말랑이",
        )


def test_login_request_requires_email_shape() -> None:
    request = LoginRequest(email="slime@example.com", password="password123")

    assert request.email == "slime@example.com"
    assert request.password == "password123"

    with pytest.raises(ValidationError):
        LoginRequest(email="not-an-email", password="password123")


def test_user_response_can_be_built_from_user_model_without_password_hash() -> None:
    user = User(
        id=1,
        email="slime@example.com",
        password_hash="hashed-password",
        nickname="말랑이",
        created_at=datetime(2026, 6, 11, 10, 0, tzinfo=timezone.utc),
    )

    response = UserResponse.model_validate(user)
    data = response.model_dump()

    assert data == {
        "id": 1,
        "email": "slime@example.com",
        "nickname": "말랑이",
        "created_at": datetime(2026, 6, 11, 10, 0, tzinfo=timezone.utc),
    }
    assert "password" not in data
    assert "password_hash" not in data
    assert "updated_at" not in data


def test_token_response_contains_access_token_and_user_but_not_refresh_token() -> None:
    user = UserResponse(
        id=1,
        email="slime@example.com",
        nickname="말랑이",
        created_at=datetime(2026, 6, 11, 10, 0, tzinfo=timezone.utc),
    )

    response = TokenResponse(
        access_token="jwt.token.value",
        expires_in=900,
        user=user,
    )
    data = response.model_dump()

    assert data["access_token"] == "jwt.token.value"
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == 900
    assert data["user"]["email"] == "slime@example.com"
    assert "refresh_token" not in data


def test_user_model_matches_users_table_contract() -> None:
    columns = User.__table__.columns

    assert User.__tablename__ == "users"
    assert columns["email"].unique is True
    assert columns["email"].nullable is False
    assert columns["password_hash"].nullable is False
    assert columns["nickname"].nullable is False
    assert "created_at" in columns
    assert "updated_at" in columns


def test_refresh_token_model_matches_refresh_tokens_table_contract() -> None:
    columns = RefreshToken.__table__.columns

    assert RefreshToken.__tablename__ == "refresh_tokens"
    assert columns["user_id"].nullable is False
    assert columns["token_hash"].unique is True
    assert columns["token_hash"].nullable is False
    assert columns["family_id"].nullable is False
    assert columns["expires_at"].nullable is False
    assert columns["revoked_at"].nullable is True
    assert columns["replaced_by_token_id"].nullable is True
    assert columns["last_used_at"].nullable is True
