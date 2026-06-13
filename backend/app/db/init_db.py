from app.db.base import Base
from app.db.session import engine
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import RefreshToken, User
from sqlalchemy import text

__all__ = ["Comment", "Post", "RefreshToken", "User"]


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE comments "
                "ADD COLUMN IF NOT EXISTS is_secret BOOLEAN NOT NULL DEFAULT false"
            )
        )
