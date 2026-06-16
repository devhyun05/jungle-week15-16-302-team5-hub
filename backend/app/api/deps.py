from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import get_user_by_id
from app.services.jwt_service import decode_access_token

settings = get_settings()


def get_current_user(
    db: Session = Depends(get_db),
    access_token: str | None = Cookie(
        default=None,
        alias=settings.access_token_cookie_name,
    ),
) -> User:
    if access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    payload = decode_access_token(access_token)
    user_id = int(payload["sub"])
    user = get_user_by_id(db, user_id=user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    return user


def get_optional_current_user(
    db: Session = Depends(get_db),
    access_token: str | None = Cookie(
        default=None,
        alias=settings.access_token_cookie_name,
    ),
) -> User | None:
    if access_token is None:
        return None

    try:
        payload = decode_access_token(access_token)
    except HTTPException:
        return None

    return get_user_by_id(db, user_id=int(payload["sub"]))
