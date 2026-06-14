from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import create_app
from app.models import Post, Tag, User
from app.seed import seed_database
from app.services.auth_service import hash_password
from app.services.tag_service import INITIAL_TAGS, normalize_tag_name, seed_initial_tags


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


def create_user(db: Session) -> User:
    user = User(
        email="slime@example.com",
        password_hash=hash_password("password123"),
        nickname="말랑이",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_normalize_tag_name_removes_hash_and_spaces() -> None:
    assert normalize_tag_name(" # 클리어 슬라임 ") == "클리어슬라임"
    assert normalize_tag_name("  레시피  ") == "레시피"
    assert normalize_tag_name("   ") == ""


def test_seed_initial_tags_is_idempotent(db: Session) -> None:
    seed_initial_tags(db)
    seed_initial_tags(db)

    assert db.query(Tag).count() == len(INITIAL_TAGS)
    assert db.query(Tag).filter(Tag.name == "클리어슬라임").one().tag_type == "slime_type"


def test_get_tags_returns_seeded_tags(client: TestClient, db: Session) -> None:
    seed_database(db)

    response = client.get("/tags")

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == len(INITIAL_TAGS)
    assert {"id", "name", "tag_type"}.issubset(data["items"][0].keys())


def test_get_tags_can_filter_by_tag_type(client: TestClient, db: Session) -> None:
    seed_database(db)

    response = client.get("/tags", params={"tag_type": "symptom"})

    assert response.status_code == 200
    data = response.json()
    assert {item["name"] for item in data["items"]} == {"끈적임", "분리됨"}
    assert {item["tag_type"] for item in data["items"]} == {"symptom"}


def test_get_popular_tags_counts_post_tag_links(
    client: TestClient,
    db: Session,
) -> None:
    seed_database(db)
    user = create_user(db)
    clear_tag = db.query(Tag).filter(Tag.name == "클리어슬라임").one()
    recipe_tag = db.query(Tag).filter(Tag.name == "레시피").one()
    sticky_tag = db.query(Tag).filter(Tag.name == "끈적임").one()
    glue_tag = db.query(Tag).filter(Tag.name == "글루").one()

    first_post = Post(
        author_id=user.id,
        title="클리어 슬라임 레시피",
        content="본문입니다.",
        post_type="recipe",
        tags=[clear_tag, recipe_tag],
    )
    second_post = Post(
        author_id=user.id,
        title="끈적임 질문",
        content="본문입니다.",
        post_type="failure",
        tags=[clear_tag, sticky_tag],
    )
    third_post = Post(
        author_id=user.id,
        title="글루 후기",
        content="본문입니다.",
        post_type="review",
        tags=[glue_tag],
    )
    db.add_all([first_post, second_post, third_post])
    db.commit()

    response = client.get("/tags/popular", params={"limit": 3})

    assert response.status_code == 200
    data = response.json()
    assert data["items"][0]["name"] == "클리어슬라임"
    assert data["items"][0]["count"] == 2
    assert len(data["items"]) == 3
    assert {"id", "name", "tag_type", "count"}.issubset(data["items"][0].keys())
