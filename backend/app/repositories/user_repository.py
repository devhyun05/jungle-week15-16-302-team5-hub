from datetime import UTC, datetime

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.security import create_token_salt, hash_token
from app.models.user import RefreshToken, User
from app.services.slack_service import SlackUserInfo


def get_user_by_id(db: Session, user_id: int) -> User | None:
    statement = select(User).where(User.id == user_id, User.deleted_at.is_(None))
    return db.scalar(statement)


def get_user_by_slack_identity(
    db: Session,
    slack_team_id: str,
    slack_user_id: str,
) -> User | None:
    statement = select(User).where(
        User.slack_team_id == slack_team_id,
        User.slack_user_id == slack_user_id,
        User.deleted_at.is_(None),
    )
    return db.scalar(statement)


def get_or_create_user_from_slack(db: Session, slack_user: SlackUserInfo) -> User:
    user = get_user_by_slack_identity(
        db,
        slack_team_id=slack_user.slack_team_id,
        slack_user_id=slack_user.slack_user_id,
    )

    if user is None:
        user = User(
            slack_user_id=slack_user.slack_user_id,
            slack_team_id=slack_user.slack_team_id,
            email=slack_user.email,
            username=slack_user.username,
            profile_image_url=slack_user.profile_image_url,
        )
        db.add(user)
    else:
        user.email = slack_user.email
        user.username = slack_user.username
        user.profile_image_url = slack_user.profile_image_url

    db.commit()
    db.refresh(user)
    return user


def save_refresh_token(
    db: Session,
    user_id: int,
    refresh_token: str,
    expires_at: datetime,
) -> RefreshToken:
    salt = create_token_salt()
    token_hash = hash_token(refresh_token, salt)
    db_token = get_refresh_token_by_user_id(db, user_id=user_id)

    if db_token is None:
        db_token = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            salt=salt,
            expires_at=expires_at,
        )
        db.add(db_token)
    else:
        db_token.token_hash = token_hash
        db_token.salt = salt
        db_token.expires_at = expires_at
        db_token.revoked_at = None

    db.commit()
    db.refresh(db_token)
    return db_token


def get_refresh_token_by_user_id(db: Session, user_id: int) -> RefreshToken | None:
    statement = select(RefreshToken).where(RefreshToken.user_id == user_id)
    return db.scalar(statement)


def verify_stored_refresh_token(
    db: Session,
    user_id: int,
    refresh_token: str,
) -> bool:
    db_token = get_refresh_token_by_user_id(db, user_id=user_id)
    if db_token is None:
        return False

    if db_token.revoked_at is not None or db_token.expires_at <= datetime.now(UTC):
        return False

    token_hash = hash_token(refresh_token, db_token.salt)
    return db_token.token_hash == token_hash


def delete_refresh_token_by_user_id(db: Session, user_id: int) -> None:
    db.execute(delete(RefreshToken).where(RefreshToken.user_id == user_id))
    db.commit()


def get_active_refresh_token(db: Session, refresh_token: str) -> RefreshToken | None:
    statement = select(RefreshToken).where(
        RefreshToken.revoked_at.is_(None),
        RefreshToken.expires_at > datetime.now(UTC),
    )
    for db_token in db.scalars(statement):
        if db_token.token_hash == hash_token(refresh_token, db_token.salt):
            return db_token
    return None


def revoke_refresh_token(db: Session, refresh_token: str) -> None:
    db_token = get_active_refresh_token(db, refresh_token=refresh_token)
    if db_token is None:
        return

    db_token.revoked_at = datetime.now(UTC)
    db.commit()
