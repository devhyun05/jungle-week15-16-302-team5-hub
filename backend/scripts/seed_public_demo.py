from pathlib import Path
import sys

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.db.session import SessionLocal
from app.models import Comment, Post, Tag, User
from app.services.auth_service import hash_password
from app.services.tag_service import get_or_create_tags


DEMO_EMAIL = "demo@malang-lab.com"


def get_or_create_demo_user(db) -> User:
    user = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if user is not None:
        return user

    user = User(
        email=DEMO_EMAIL,
        password_hash=hash_password("malang-demo-password"),
        nickname="말랑이",
    )
    db.add(user)
    db.flush()
    return user


def get_or_create_post(db, user: User, post_data: dict) -> Post:
    post = (
        db.query(Post)
        .filter(Post.author_id == user.id, Post.title == post_data["title"])
        .first()
    )
    if post is None:
        post = Post(
            author_id=user.id,
            title=post_data["title"],
            content=post_data["content"],
            post_type=post_data["post_type"],
            slime_type=post_data.get("slime_type"),
        )
        db.add(post)
        db.flush()

    post.tags = get_or_create_tags(db, post_data["tags"])
    return post


def ensure_comment(db, user: User, post: Post, content: str) -> None:
    comment = (
        db.query(Comment)
        .filter(
            Comment.post_id == post.id,
            Comment.author_id == user.id,
            Comment.content == content,
        )
        .first()
    )
    if comment is None:
        db.add(
            Comment(
                post_id=post.id,
                author_id=user.id,
                content=content,
            )
        )


def main() -> None:
    db = SessionLocal()
    try:
        user = get_or_create_demo_user(db)
        recipe_post = get_or_create_post(
            db,
            user,
            {
                "title": "말랑말랑 슬라임",
                "content": "아이클레이로 만들 푹신 슬라임",
                "post_type": "recipe",
                "slime_type": "푹신슬라임",
                "tags": ["초보자추천", "퐁신말랑"],
            },
        )
        failure_post = get_or_create_post(
            db,
            user,
            {
                "title": "슬라임이 녹아요ㅜㅡㅜ",
                "content": "소다 계속 넣어도 안 굳어요 어카죠",
                "post_type": "failure",
                "slime_type": None,
                "tags": ["실패해결", "헬프미"],
            },
        )

        ensure_comment(db, user, recipe_post, "색감도 귀엽고 초보자가 따라 하기 좋아요.")
        ensure_comment(db, user, failure_post, "액티베이터를 아주 소량씩 나눠 넣고 충분히 섞어보세요.")

        db.commit()
        print(
            {
                "users": db.query(User).count(),
                "posts": db.query(Post).count(),
                "comments": db.query(Comment).count(),
                "tags": db.query(Tag).count(),
            }
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
