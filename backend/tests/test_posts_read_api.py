from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import create_app
from app.models import Comment, Post, Tag, User
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


def create_user(db: Session, email: str = "slime@example.com") -> User:
    user = User(
        email=email,
        password_hash=hash_password("password123"),
        nickname="말랑이",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def seed_posts(db: Session) -> dict[str, Post | User]:
    author = create_user(db)
    helper = create_user(db, email="helper@example.com")

    clear_tag = Tag(name="클리어슬라임", tag_type="slime_type")
    recipe_tag = Tag(name="레시피", tag_type="purpose")
    sticky_tag = Tag(name="끈적임", tag_type="symptom")
    glue_tag = Tag(name="글루", tag_type="ingredient")

    recipe_post = Post(
        author_id=author.id,
        title="클리어 슬라임 레시피",
        content="액티베이터를 조금씩 넣고 충분히 섞어요.",
        post_type="recipe",
        slime_type="클리어슬라임",
        tags=[clear_tag, recipe_tag],
    )
    failure_post = Post(
        author_id=helper.id,
        title="끈적임 실패 질문",
        content="손에 계속 묻어서 해결 방법이 궁금해요.",
        post_type="failure",
        slime_type="클리어슬라임",
        tags=[clear_tag, sticky_tag],
    )
    review_post = Post(
        author_id=helper.id,
        title="글루 구매 후기",
        content="점도가 안정적이라 버터 슬라임에도 괜찮았어요.",
        post_type="review",
        slime_type="버터슬라임",
        tags=[glue_tag],
    )
    comment = Comment(
        post=recipe_post,
        author_id=helper.id,
        content="초보자도 따라 하기 좋아요.",
    )

    db.add_all([recipe_post, failure_post, review_post, comment])
    db.commit()
    db.refresh(recipe_post)
    db.refresh(failure_post)
    db.refresh(review_post)

    return {
        "author": author,
        "recipe_post": recipe_post,
        "failure_post": failure_post,
        "review_post": review_post,
    }


def test_get_posts_returns_latest_posts_with_pagination(
    client: TestClient,
    db: Session,
) -> None:
    seed_posts(db)

    response = client.get("/posts", params={"page": 1, "size": 2})

    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["size"] == 2
    assert data["total"] == 3
    assert data["total_pages"] == 2
    assert [item["title"] for item in data["items"]] == [
        "글루 구매 후기",
        "끈적임 실패 질문",
    ]


def test_get_posts_filters_keyword_type_slime_and_single_tag(
    client: TestClient,
    db: Session,
) -> None:
    seed_posts(db)

    keyword_response = client.get("/posts", params={"keyword": "액티베이터"})
    type_response = client.get("/posts", params={"post_type": "failure"})
    slime_response = client.get("/posts", params={"slime_type": "버터슬라임"})
    tag_response = client.get("/posts", params={"tag": "클리어슬라임"})

    assert keyword_response.status_code == 200
    assert [item["title"] for item in keyword_response.json()["items"]] == [
        "클리어 슬라임 레시피",
    ]
    assert [item["title"] for item in type_response.json()["items"]] == [
        "끈적임 실패 질문",
    ]
    assert [item["title"] for item in slime_response.json()["items"]] == [
        "글루 구매 후기",
    ]
    assert {item["title"] for item in tag_response.json()["items"]} == {
        "클리어 슬라임 레시피",
        "끈적임 실패 질문",
    }


def test_get_posts_filters_repeated_tags_with_and_condition(
    client: TestClient,
    db: Session,
) -> None:
    seed_posts(db)

    response = client.get(
        "/posts",
        params=[
            ("tag", "# 클리어 슬라임"),
            ("tags", "레시피"),
            ("tags", "레시피"),
        ],
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "클리어 슬라임 레시피"
    assert data["items"][0]["tags"] == ["클리어슬라임", "레시피"]


def test_get_post_detail_returns_post_and_404(
    client: TestClient,
    db: Session,
) -> None:
    seeded = seed_posts(db)
    recipe_post = seeded["recipe_post"]

    response = client.get(f"/posts/{recipe_post.id}")
    missing_response = client.get("/posts/9999")

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "클리어 슬라임 레시피"
    assert data["comment_count"] == 1
    assert data["is_owner"] is False
    assert missing_response.status_code == 404


def test_get_post_detail_marks_owner_when_access_token_matches_author(
    client: TestClient,
    db: Session,
) -> None:
    seeded = seed_posts(db)
    author = seeded["author"]
    recipe_post = seeded["recipe_post"]
    access_token = create_access_token(author)

    response = client.get(
        f"/posts/{recipe_post.id}",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200
    assert response.json()["is_owner"] is True
