from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repository import (
    get_or_create_user_from_slack,
    save_refresh_token,
)
from app.services.jwt_service import (
    create_access_token,
    create_refresh_token,
    get_refresh_token_expires_at,
)
from app.services.slack_service import (
    exchange_code_for_access_token,
    fetch_slack_user_info,
    validate_allowed_email,
    validate_allowed_workspace,
)


async def login_with_slack_code(db: Session, code: str) -> tuple[User, str, str]:
    slack_access_token = await exchange_code_for_access_token(code=code)
    slack_user = await fetch_slack_user_info(access_token=slack_access_token)
    validate_allowed_workspace(slack_team_id=slack_user.slack_team_id)
    validate_allowed_email(email=slack_user.email)

    user = get_or_create_user_from_slack(db, slack_user=slack_user)
    access_token = create_access_token(user_id=user.id, role=user.role)
    refresh_token = create_refresh_token(user_id=user.id)

    save_refresh_token(
        db,
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=get_refresh_token_expires_at(),
    )

    return user, access_token, refresh_token
