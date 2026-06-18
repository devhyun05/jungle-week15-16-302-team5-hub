from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import AuthRefreshToken


def create_refresh_token_record(
    db: Session,
    user_id: int,
    token_hash: str,
    expires_at: datetime,
    user_agent: str | None,
    ip_address: str | None,
) -> AuthRefreshToken:
    """
    refresh token 원문이 아니라 hash만 DB에 저장한다.

    사용자의 브라우저에는 긴 random refresh token 원문을 cookie로 내려주지만,
    DB에는 sha256 hash 결과만 저장한다. 이렇게 하면 DB가 노출되어도 refresh token 원문을
    바로 재사용하기 어렵다.
    """

    refresh_token = AuthRefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
        user_agent=user_agent,
        ip_address=ip_address,
    )

    db.add(refresh_token)
    db.commit()
    db.refresh(refresh_token)

    return refresh_token


def get_refresh_token_by_hash(db: Session, token_hash: str) -> AuthRefreshToken | None:
    """
    cookie로 받은 refresh token을 hash한 뒤 DB에서 같은 hash를 찾는다.

    refresh API에서는 원문 token을 DB에서 찾는 것이 아니라,
    request cookie 원문 -> hash -> DB token_hash 비교 순서로 검증한다.
    """

    return db.scalar(
        select(AuthRefreshToken).where(AuthRefreshToken.token_hash == token_hash)
    )


def is_refresh_token_active(refresh_token: AuthRefreshToken) -> bool:
    """
    refresh token이 아직 사용할 수 있는 상태인지 확인한다.

    revoked_at이 채워져 있으면 로그아웃이나 rotation으로 폐기된 token이고,
    expires_at이 현재 시각보다 과거면 만료된 token이다.
    """

    now = datetime.now(timezone.utc)

    return refresh_token.revoked_at is None and refresh_token.expires_at > now


def revoke_refresh_token(
    db: Session,
    refresh_token: AuthRefreshToken,
    replaced_by_token_id: int | None = None,
) -> AuthRefreshToken:
    """
    refresh token을 폐기 처리한다.

    로그아웃이면 replaced_by_token_id가 없고,
    refresh token rotation이면 새 token id를 replaced_by_token_id에 연결한다.
    이렇게 하면 나중에 이상한 재사용 공격이 있었는지 추적하기 쉬워진다.
    """

    refresh_token.revoked_at = datetime.now(timezone.utc)
    refresh_token.replaced_by_token_id = replaced_by_token_id

    db.commit()
    db.refresh(refresh_token)

    return refresh_token
