from pathlib import Path
import os
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.db.base import Base
from app.db.session import normalize_database_url
from app.models import Comment, Post, RefreshToken, Tag, User, post_tags  # noqa: F401
from app.seed import seed_database


def create_session(database_url: str):
    normalized_url = normalize_database_url(database_url)
    connect_args = {"check_same_thread": False} if normalized_url.startswith("sqlite") else {}
    engine = create_engine(normalized_url, connect_args=connect_args)
    Base.metadata.create_all(bind=engine)
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)()


def main() -> None:
    source_db = create_session(os.environ["SOURCE_DATABASE_URL"])
    target_db = create_session(os.environ["TARGET_DATABASE_URL"])

    try:
        seed_database(target_db)

        users_by_source_id: dict[int, User] = {}
        for source_user in source_db.query(User).order_by(User.id).all():
            target_user = target_db.query(User).filter(User.email == source_user.email).first()
            if target_user is None:
                target_user = User(
                    email=source_user.email,
                    password_hash=source_user.password_hash,
                    nickname=source_user.nickname,
                    created_at=source_user.created_at,
                    updated_at=source_user.updated_at,
                )
                target_db.add(target_user)
                target_db.flush()
            users_by_source_id[source_user.id] = target_user

        tags_by_name: dict[str, Tag] = {
            tag.name: tag
            for tag in target_db.query(Tag).all()
        }
        for source_tag in source_db.query(Tag).order_by(Tag.id).all():
            target_tag = tags_by_name.get(source_tag.name)
            if target_tag is None:
                target_tag = Tag(
                    name=source_tag.name,
                    tag_type=source_tag.tag_type,
                    created_at=source_tag.created_at,
                )
                target_db.add(target_tag)
                target_db.flush()
                tags_by_name[target_tag.name] = target_tag

        posts_by_source_id: dict[int, Post] = {}
        for source_post in source_db.query(Post).order_by(Post.id).all():
            target_author = users_by_source_id[source_post.author_id]
            target_post = (
                target_db.query(Post)
                .filter(
                    Post.author_id == target_author.id,
                    Post.title == source_post.title,
                )
                .first()
            )
            if target_post is None:
                target_post = Post(
                    author_id=target_author.id,
                    title=source_post.title,
                    content=source_post.content,
                    image_url=source_post.image_url,
                    post_type=source_post.post_type,
                    slime_type=source_post.slime_type,
                    created_at=source_post.created_at,
                    updated_at=source_post.updated_at,
                )
                target_db.add(target_post)
                target_db.flush()

            target_post.image_url = source_post.image_url
            target_post.tags = [
                tags_by_name[source_tag.name]
                for source_tag in source_post.tags
                if source_tag.name in tags_by_name
            ]
            posts_by_source_id[source_post.id] = target_post

        for source_comment in source_db.query(Comment).order_by(Comment.id).all():
            target_post = posts_by_source_id[source_comment.post_id]
            target_author = users_by_source_id[source_comment.author_id]
            target_comment = (
                target_db.query(Comment)
                .filter(
                    Comment.post_id == target_post.id,
                    Comment.author_id == target_author.id,
                    Comment.content == source_comment.content,
                )
                .first()
            )
            if target_comment is None:
                target_db.add(
                    Comment(
                        post_id=target_post.id,
                        author_id=target_author.id,
                        content=source_comment.content,
                        created_at=source_comment.created_at,
                        updated_at=source_comment.updated_at,
                    )
                )

        target_db.commit()
        print(
            {
                "users": target_db.query(User).count(),
                "posts": target_db.query(Post).count(),
                "comments": target_db.query(Comment).count(),
                "tags": target_db.query(Tag).count(),
            }
        )
    finally:
        source_db.close()
        target_db.close()


if __name__ == "__main__":
    main()
