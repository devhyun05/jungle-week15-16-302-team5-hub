from datetime import datetime, timezone

import pytest
from fastapi import HTTPException
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import get_settings
from app.db.base import Base
from app.models import RefreshToken, User
from app.services.auth_service import (
    create_access_token,
    get_current_user,
    get_user_by_email,
    get_valid_refresh_token,
    hash_password,
    issue_tokens,
    revoke_refresh_token,
    rotate_refresh_token,
    verify_password,
)


@pytest.fixture()
def db() -> Session:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


def create_user(db: Session, email: str = "slime@example.com") -> User:
    user = User(
        email=email,
        password_hash=hash_password("password123"),
        nickname="말랑이",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_hash_password_does_not_store_plaintext_and_can_be_verified() -> None:
    password_hash = hash_password("password123")

    assert password_hash != "password123"
    assert password_hash.startswith("pbkdf2_sha256$210000$")
    assert verify_password("password123", password_hash) is True
    assert verify_password("wrong-password", password_hash) is False


def test_get_user_by_email_returns_matching_user(db: Session) -> None:
    user = create_user(db)

    found = get_user_by_email(db, "slime@example.com")
    missing = get_user_by_email(db, "missing@example.com")

    assert found is not None
    assert found.id == user.id
    assert missing is None


def test_create_access_token_contains_access_claims() -> None:
    settings = get_settings()
    user = User(id=7, email="slime@example.com", password_hash="hash", nickname="말랑이")

    access_token = create_access_token(user)
    payload = jwt.decode(
        access_token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
    )

    assert payload["sub"] == "7"
    assert payload["type"] == "access"
    assert "iat" in payload
    assert "exp" in payload


def test_issue_tokens_stores_refresh_hash_not_raw_token(db: Session) -> None:
    user = create_user(db)

    access_token, refresh_token, token_row = issue_tokens(db, user)

    assert isinstance(access_token, str)
    assert isinstance(refresh_token, str)
    assert token_row.id is not None
    assert token_row.user_id == user.id
    assert token_row.token_hash != refresh_token
    assert db.query(RefreshToken).count() == 1
    assert get_valid_refresh_token(db, refresh_token).id == token_row.id


def test_get_valid_refresh_token_rejects_unknown_token(db: Session) -> None:
    with pytest.raises(HTTPException) as exc_info:
        get_valid_refresh_token(db, "unknown-token")

    assert exc_info.value.status_code == 401


def test_rotate_refresh_token_revokes_old_token_and_issues_new_one(db: Session) -> None:
    user = create_user(db)
    _, old_refresh_token, old_token_row = issue_tokens(db, user)

    new_access_token, new_refresh_token, returned_user = rotate_refresh_token(
        db,
        old_refresh_token,
    )

    db.refresh(old_token_row)
    new_token_row = get_valid_refresh_token(db, new_refresh_token)

    assert isinstance(new_access_token, str)
    assert new_refresh_token != old_refresh_token
    assert returned_user.id == user.id
    assert old_token_row.revoked_at is not None
    assert old_token_row.last_used_at is not None
    assert old_token_row.replaced_by_token_id == new_token_row.id
    assert new_token_row.family_id == old_token_row.family_id

    with pytest.raises(HTTPException):
        get_valid_refresh_token(db, old_refresh_token)


def test_revoke_refresh_token_marks_token_as_revoked(db: Session) -> None:
    user = create_user(db)
    _, refresh_token, token_row = issue_tokens(db, user)

    revoke_refresh_token(db, refresh_token)

    db.refresh(token_row)
    assert token_row.revoked_at is not None


def test_get_current_user_decodes_access_token_and_loads_user(db: Session) -> None:
    user = create_user(db)
    access_token = create_access_token(user)

    current_user = get_current_user(token=access_token, db=db)

    assert current_user.id == user.id
