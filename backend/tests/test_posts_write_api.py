from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import create_app
from app.models import Post, Tag, User, post_tags
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
    clear_tag = Tag(name="클리어슬라임", tag_type="slime_type")
    recipe_tag = Tag(name="레시피", tag_type="purpose")
    post = Post(
        author_id=author.id,
        title="기존 레시피",
        content="기존 본문입니다.",
        post_type="recipe",
        slime_type="클리어슬라임",
        tags=[clear_tag, recipe_tag],
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def test_create_post_requires_login(client: TestClient) -> None:
    response = client.post(
        "/posts",
        json={
            "title": "로그인 없는 글",
            "content": "작성하면 안 됩니다.",
            "post_type": "general",
            "tag_names": [],
        },
    )

    assert response.status_code == 401


def test_create_post_stores_post_and_normalized_tags(
    client: TestClient,
    db: Session,
) -> None:
    author = create_user(db)

    response = client.post(
        "/posts",
        json={
            "title": "딸기향 투명 슬라임",
            "content": "액티베이터를 조금씩 넣어요.",
            "post_type": "recipe",
            "slime_type": "클리어슬라임",
            "tag_names": ["# 클리어 슬라임", "레시피", "레시피", "향료"],
        },
        headers=auth_headers(author),
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "딸기향 투명 슬라임"
    assert data["author"]["email"] == author.email
    assert data["is_owner"] is True
    assert data["tags"] == ["클리어슬라임", "레시피", "향료"]

    post = db.query(Post).filter(Post.id == data["id"]).one()
    assert post.author_id == author.id
    assert [tag.name for tag in post.tags] == ["클리어슬라임", "레시피", "향료"]
    assert db.query(Tag).filter(Tag.name == "클리어슬라임").one().tag_type == "custom"


def test_update_post_changes_only_owner_fields_and_replaces_tags(
    client: TestClient,
    db: Session,
) -> None:
    author = create_user(db)
    post = create_post_row(db, author)

    response = client.patch(
        f"/posts/{post.id}",
        json={
            "title": "수정한 레시피",
            "tag_names": ["버터 슬라임", "초보자추천"],
        },
        headers=auth_headers(author),
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "수정한 레시피"
    assert data["content"] == "기존 본문입니다."
    assert data["tags"] == ["버터슬라임", "초보자추천"]

    db.refresh(post)
    assert post.title == "수정한 레시피"
    assert post.content == "기존 본문입니다."
    assert [tag.name for tag in post.tags] == ["버터슬라임", "초보자추천"]


def test_update_post_returns_404_and_403(
    client: TestClient,
    db: Session,
) -> None:
    author = create_user(db)
    other_user = create_user(db, email="other@example.com", nickname="다른이")
    post = create_post_row(db, author)

    missing_response = client.patch(
        "/posts/9999",
        json={"title": "없는 글"},
        headers=auth_headers(author),
    )
    forbidden_response = client.patch(
        f"/posts/{post.id}",
        json={"title": "남의 글 수정"},
        headers=auth_headers(other_user),
    )

    assert missing_response.status_code == 404
    assert forbidden_response.status_code == 403


def test_delete_post_removes_post_and_connections(
    client: TestClient,
    db: Session,
) -> None:
    author = create_user(db)
    post = create_post_row(db, author)

    response = client.delete(
        f"/posts/{post.id}",
        headers=auth_headers(author),
    )

    assert response.status_code == 204
    assert response.content == b""
    assert db.query(Post).filter(Post.id == post.id).first() is None
    assert db.query(post_tags).count() == 0


def test_delete_post_returns_404_and_403(
    client: TestClient,
    db: Session,
) -> None:
    author = create_user(db)
    other_user = create_user(db, email="other@example.com", nickname="다른이")
    post = create_post_row(db, author)

    missing_response = client.delete(
        "/posts/9999",
        headers=auth_headers(author),
    )
    forbidden_response = client.delete(
        f"/posts/{post.id}",
        headers=auth_headers(other_user),
    )

    assert missing_response.status_code == 404
    assert forbidden_response.status_code == 403
