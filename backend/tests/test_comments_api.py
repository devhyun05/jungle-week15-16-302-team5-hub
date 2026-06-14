from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import create_app
from app.models import Comment, Post, User
from app.services.auth_service import create_access_token, hash_password


@pytest.fixture()
def db() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db: Session) -> TestClient:
    app = create_app()

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)


def create_user(
    db: Session,
    email: str = "slime@example.com",
    nickname: str = "말랑이",
) -> User:
    user = User(
        email=email,
        password_hash=hash_password("password123"),
        nickname=nickname,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def auth_headers(user: User) -> dict[str, str]:
    access_token = create_access_token(user)
    return {"Authorization": f"Bearer {access_token}"}


def create_post_row(db: Session, author: User) -> Post:
    post = Post(
        author_id=author.id,
        title="클리어 슬라임 질문",
        content="액티베이터를 넣어도 계속 묽어요.",
        post_type="failure",
        slime_type="클리어슬라임",
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def create_comment_row(
    db: Session,
    post: Post,
    author: User,
    content: str = "액티베이터를 조금씩 나눠 넣어보세요.",
) -> Comment:
    comment = Comment(
        post_id=post.id,
        author_id=author.id,
        content=content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def test_get_comments_returns_items_and_marks_owner(
    client: TestClient,
    db: Session,
) -> None:
    post_author = create_user(db)
    helper = create_user(db, email="helper@example.com", nickname="도움이")
    post = create_post_row(db, post_author)
    create_comment_row(db, post, helper, "초보자도 따라 하기 좋아요.")
    create_comment_row(db, post, post_author, "답변 고마워요.")

    anonymous_response = client.get(f"/posts/{post.id}/comments")
    owner_response = client.get(
        f"/posts/{post.id}/comments",
        headers=auth_headers(helper),
    )

    assert anonymous_response.status_code == 200
    assert [item["content"] for item in anonymous_response.json()["items"]] == [
        "초보자도 따라 하기 좋아요.",
        "답변 고마워요.",
    ]
    assert [item["is_owner"] for item in anonymous_response.json()["items"]] == [
        False,
        False,
    ]

    owner_items = owner_response.json()["items"]
    assert owner_response.status_code == 200
    assert owner_items[0]["author"]["email"] == helper.email
    assert owner_items[0]["is_owner"] is True
    assert owner_items[1]["is_owner"] is False


def test_get_comments_returns_404_when_post_missing(client: TestClient) -> None:
    response = client.get("/posts/9999/comments")

    assert response.status_code == 404


def test_create_comment_requires_login_and_stores_comment(
    client: TestClient,
    db: Session,
) -> None:
    post_author = create_user(db)
    helper = create_user(db, email="helper@example.com", nickname="도움이")
    post = create_post_row(db, post_author)

    missing_token_response = client.post(
        f"/posts/{post.id}/comments",
        json={"content": "로그인 없이 쓰면 안 됩니다."},
    )
    response = client.post(
        f"/posts/{post.id}/comments",
        json={"content": "액티베이터를 2~3방울씩 넣어보세요."},
        headers=auth_headers(helper),
    )

    assert missing_token_response.status_code == 401
    assert response.status_code == 201

    data = response.json()
    assert data["post_id"] == post.id
    assert data["content"] == "액티베이터를 2~3방울씩 넣어보세요."
    assert data["author"]["email"] == helper.email
    assert data["is_owner"] is True
    assert "updated_at" in data

    comment = db.query(Comment).filter(Comment.id == data["id"]).one()
    assert comment.post_id == post.id
    assert comment.author_id == helper.id


def test_create_comment_returns_404_when_post_missing(
    client: TestClient,
    db: Session,
) -> None:
    user = create_user(db)

    response = client.post(
        "/posts/9999/comments",
        json={"content": "없는 글에는 달 수 없습니다."},
        headers=auth_headers(user),
    )

    assert response.status_code == 404


def test_update_comment_changes_only_owner_comment(
    client: TestClient,
    db: Session,
) -> None:
    post_author = create_user(db)
    helper = create_user(db, email="helper@example.com", nickname="도움이")
    other_user = create_user(db, email="other@example.com", nickname="다른이")
    post = create_post_row(db, post_author)
    comment = create_comment_row(db, post, helper)

    forbidden_response = client.patch(
        f"/comments/{comment.id}",
        json={"content": "남의 댓글 수정"},
        headers=auth_headers(other_user),
    )
    response = client.patch(
        f"/comments/{comment.id}",
        json={"content": "소량씩 넣고 충분히 치대보세요."},
        headers=auth_headers(helper),
    )
    missing_response = client.patch(
        "/comments/9999",
        json={"content": "없는 댓글 수정"},
        headers=auth_headers(helper),
    )

    assert forbidden_response.status_code == 403
    assert response.status_code == 200
    assert response.json()["content"] == "소량씩 넣고 충분히 치대보세요."
    assert response.json()["is_owner"] is True
    assert missing_response.status_code == 404

    db.refresh(comment)
    assert comment.content == "소량씩 넣고 충분히 치대보세요."


def test_delete_comment_removes_only_owner_comment(
    client: TestClient,
    db: Session,
) -> None:
    post_author = create_user(db)
    helper = create_user(db, email="helper@example.com", nickname="도움이")
    other_user = create_user(db, email="other@example.com", nickname="다른이")
    post = create_post_row(db, post_author)
    comment = create_comment_row(db, post, helper)

    forbidden_response = client.delete(
        f"/comments/{comment.id}",
        headers=auth_headers(other_user),
    )
    response = client.delete(
        f"/comments/{comment.id}",
        headers=auth_headers(helper),
    )
    missing_response = client.delete(
        "/comments/9999",
        headers=auth_headers(helper),
    )

    assert forbidden_response.status_code == 403
    assert response.status_code == 204
    assert response.content == b""
    assert missing_response.status_code == 404
    assert db.query(Comment).filter(Comment.id == comment.id).first() is None
