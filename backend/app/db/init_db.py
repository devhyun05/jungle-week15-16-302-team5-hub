from app.db.base import Base
from app.db.session import engine
from app.models.ai import PostWritingEmbedding, RestrictedTradePolicyEmbedding
from app.models.comment import Comment
from app.models.post import Post
from app.models.post_image import PostImage
from app.models.post_like import PostLike
from app.models.user import RefreshToken, User
from sqlalchemy import text

__all__ = [
    "Comment",
    "Post",
    "PostImage",
    "PostLike",
    "PostWritingEmbedding",
    "RestrictedTradePolicyEmbedding",
    "RefreshToken",
    "User",
]


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE comments "
                "ADD COLUMN IF NOT EXISTS is_secret BOOLEAN NOT NULL DEFAULT false"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE posts "
                "ADD COLUMN IF NOT EXISTS category VARCHAR(30) NOT NULL DEFAULT '기타'"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE post_images "
                "ADD COLUMN IF NOT EXISTS object_key TEXT NOT NULL DEFAULT ''"
            )
        )
        connection.execute(
            text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT")
        )
        connection.execute(
            text("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_user_id VARCHAR(100)")
        )
        connection.execute(
            text("ALTER TABLE users ALTER COLUMN slack_user_id DROP NOT NULL")
        )
        connection.execute(
            text("ALTER TABLE users ALTER COLUMN slack_team_id DROP NOT NULL")
        )
