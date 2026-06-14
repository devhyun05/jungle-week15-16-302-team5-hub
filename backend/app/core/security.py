# refresh token 해시를 만들 때 hashlib를 사용한다.
import hashlib
# refresh token 원문은 예측할 수 없어야 하므로 secrets로 안전한 랜덤 문자열을 만든다.
import secrets
# access token과 refresh token 만료 시각을 계산하기 위해 datetime을 사용한다.
from datetime import datetime, timedelta, timezone

# JWT 생성/검증은 직접 구현하지 않고 검증된 python-jose 라이브러리를 사용한다.
from jose import JWTError, jwt

# 토큰 만료 시간, 알고리즘, secret key는 .env에서 읽은 settings를 사용한다.
from app.core.config import settings


def get_access_token_expires_at() -> datetime:
    """Return the UTC expiration time for a new access token."""

    # access token은 짧게 유지한다.
    # 탈취되더라도 사용할 수 있는 시간을 줄이기 위해 기본값은 15분이다.
    return datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_access_token_expire_minutes,
    )


def get_refresh_token_expires_at() -> datetime:
    """Return the UTC expiration time for a new refresh token."""

    # refresh token은 사용자가 매번 Google 로그인을 다시 하지 않게 하기 위한 긴 수명 토큰이다.
    # 대신 DB에 해시를 저장하고 revoked_at으로 폐기 가능하게 관리한다.
    return datetime.now(timezone.utc) + timedelta(
        days=settings.jwt_refresh_token_expire_days,
    )


def create_access_token(user_id: int) -> str:
    """Create a signed JWT access token for one user id."""

    # JWT payload는 토큰 안에 담기는 데이터다.
    # role은 토큰에 넣지 않고 DB에서 다시 읽는다. 그래야 관리자가 role을 바꿨을 때 오래된 토큰 때문에 권한이 어긋나지 않는다.
    payload = {
        "sub": str(user_id),
        "type": "access",
        "iat": datetime.now(timezone.utc),
        "exp": get_access_token_expires_at(),
    }

    # settings.jwt_secret_key로 서명해서 사용자가 임의로 payload를 바꾸지 못하게 한다.
    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> int | None:
    """Return the user id from a valid access token, or None when invalid."""

    try:
        # jwt.decode는 서명과 exp 만료 시간을 함께 검증한다.
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError:
        # 서명이 틀렸거나, 만료되었거나, JWT 형식이 아니면 현재 사용자를 알 수 없다.
        return None

    # access token 자리에 refresh token이 들어오는 실수를 막기 위해 type을 확인한다.
    if payload.get("type") != "access":
        return None

    subject = payload.get("sub")

    if subject is None:
        return None

    try:
        return int(subject)
    except ValueError:
        return None


def create_refresh_token() -> str:
    """Create a secure random refresh token string."""

    # token_urlsafe는 URL/cookie에 넣기 좋은 안전한 랜덤 문자열을 만든다.
    # 이 원문은 브라우저 HttpOnly cookie에만 보내고, DB에는 해시만 저장한다.
    return secrets.token_urlsafe(64)


def hash_refresh_token(refresh_token: str) -> str:
    """Hash a refresh token before storing or looking it up in the database."""

    # refresh token 원문을 DB에 저장하지 않기 위해 sha256 해시로 바꾼다.
    # sha256().hexdigest() 결과는 64자 문자열이라 auth_refresh_tokens.token_hash varchar(64)와 맞다.
    return hashlib.sha256(refresh_token.encode("utf-8")).hexdigest()
