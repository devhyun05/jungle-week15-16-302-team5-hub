from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    generate_csrf_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.session import UserSession
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse


@dataclass
class LoginResult:
    token_response: TokenResponse
    refresh_token: str
    csrf_token: str


@dataclass
class RefreshResult:
    token_response: TokenResponse
    refresh_token: str
    csrf_token: str


def ensure_utc_aware(value: datetime) -> datetime:
    if value.tzinfo is None or value.tzinfo.utcoffset(value) is None:
        return value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc)


def signup(db: Session, signup_request: SignupRequest) -> User:
    email_normalized = signup_request.email.lower()
    existing_user = db.query(User).filter(User.email == email_normalized).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    password_hash = hash_password(signup_request.password)

    user = User(
        email=email_normalized,
        display_name=signup_request.display_name,
        password_hash=password_hash,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def login(db: Session, login_request: LoginRequest) -> LoginResult:
    email_normalized = login_request.email.lower()
    user = db.query(User).filter(User.email == email_normalized).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(login_request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(subject=str(user.id))

    now = datetime.now(timezone.utc)

    session = UserSession(
        user_id=user.id,
        expires_at=now + timedelta(days=settings.refresh_token_expire_days),
        absolute_expires_at=now + timedelta(days=settings.refresh_session_absolute_days),
    )

    db.add(session)
    db.flush()

    raw_refresh_token = generate_refresh_token()
    refresh_token_hash = hash_refresh_token(raw_refresh_token)
    csrf_token = generate_csrf_token()

    refresh_token = RefreshToken(
        session_id=session.id,
        token_hash=refresh_token_hash,
        issued_at=now,
        expires_at=session.expires_at,
    )

    db.add(refresh_token)
    db.commit()

    return LoginResult(
        token_response=TokenResponse(access_token=access_token, user=user),
        refresh_token=raw_refresh_token,
        csrf_token=csrf_token,
    )


def refresh_access_token(
    db: Session,
    raw_refresh_token: str,
    csrf_cookie: str,
    csrf_header: str,
) -> RefreshResult:
    if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
        raise HTTPException(status_code=403, detail="Invalid CSRF token")

    token_hash = hash_refresh_token(raw_refresh_token)

    refresh_token = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash)
        .first()
    )

    if not refresh_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    session = db.get(UserSession, refresh_token.session_id)

    if not session:
        raise HTTPException(status_code=401, detail="Invalid Session")

    now = datetime.now(timezone.utc)
    session_expires_at = ensure_utc_aware(session.expires_at)
    session_absolute_expires_at = ensure_utc_aware(session.absolute_expires_at)
    refresh_token_expires_at = ensure_utc_aware(refresh_token.expires_at)

    if session.revoked_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session revoked",
        )

    if session_expires_at <= now:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )

    if session_absolute_expires_at <= now:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )

    if refresh_token.revoked_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token revoked",
        )

    if refresh_token_expires_at <= now:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )

    if refresh_token.used_at is not None:
        session.revoked_at = now
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token reused",
        )

    new_raw_refresh_token = generate_refresh_token()
    new_refresh_token_hash = hash_refresh_token(new_raw_refresh_token)
    new_csrf_token = generate_csrf_token()

    new_session_expires_at = min(
        now + timedelta(days=settings.refresh_token_expire_days),
        session_absolute_expires_at,
    )

    session.expires_at = new_session_expires_at
    refresh_token.used_at = now

    new_refresh_token = RefreshToken(
        session_id=session.id,
        token_hash=new_refresh_token_hash,
        issued_at=now,
        expires_at=new_session_expires_at,
    )

    db.add(new_refresh_token)
    db.flush()

    refresh_token.replaced_by_token_id = new_refresh_token.id
    db.commit()

    access_token = create_access_token(subject=str(session.user_id))

    user = db.get(User, session.user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    return RefreshResult(
        token_response=TokenResponse(access_token=access_token, user=user),
        refresh_token=new_raw_refresh_token,
        csrf_token=new_csrf_token,
    )


def logout_refresh_session(
    db: Session,
    raw_refresh_token: str,
    csrf_cookie: str,
    csrf_header: str,
) -> None:
    if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
        raise HTTPException(status_code=403, detail="Invalid CSRF token")

    token_hash = hash_refresh_token(raw_refresh_token)

    refresh_token = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash)
        .first()
    )

    if not refresh_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    session = db.get(UserSession, refresh_token.session_id)

    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    now = datetime.now(timezone.utc)

    session.revoked_at = now
    refresh_token.revoked_at = now

    db.commit()
