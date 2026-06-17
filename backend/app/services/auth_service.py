from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repository import (
    get_or_create_user_from_google,
    save_refresh_token,
)
from app.services.google_service import (
    exchange_google_code_for_access_token,
    fetch_google_user_info,
)
from app.services.jwt_service import (
    create_access_token,
    create_refresh_token,
    get_refresh_token_expires_at,
)
from app.services.slack_service import lookup_slack_user_by_email


async def login_with_google_code(db: Session, code: str) -> tuple[User, str, str]:
    google_access_token = await exchange_google_code_for_access_token(code=code)
    google_user = await fetch_google_user_info(access_token=google_access_token)
    slack_user = await lookup_slack_user_by_email(email=google_user.email)

    user = get_or_create_user_from_google(
        db,
        google_user=google_user,
        slack_user=slack_user,
    )
    return issue_login_tokens(db, user=user)


def issue_login_tokens(db: Session, user: User) -> tuple[User, str, str]:
    access_token = create_access_token(user_id=user.id, role=user.role)
    refresh_token = create_refresh_token(user_id=user.id)

    save_refresh_token(
        db,
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=get_refresh_token_expires_at(),
    )

    return user, access_token, refresh_token
