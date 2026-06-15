from collections.abc import Generator

import pytest
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.models import Comment, Post, Tag, User
from app.schemas.post import PostCreate, PostListResponse, PostUpdate
from app.services.auth_service import hash_password
from app.services.post_service import make_post_summary, post_to_response


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


def test_post_create_matches_frontend_write_payload() -> None:
    request = PostCreate(
        title="딸기향 투명 슬라임 만들기",
        content="처음 만드는 사람도 따라할 수 있는 투명 슬라임 레시피입니다.",
        post_type="recipe",
        slime_type="클리어슬라임",
        image_url=" data:image/webp;base64,aW1hZ2U= ",
        tag_names=["클리어슬라임", "레시피"],
    )

    assert request.title == "딸기향 투명 슬라임 만들기"
    assert request.post_type == "recipe"
    assert request.slime_type == "클리어슬라임"
    assert request.image_url == "data:image/webp;base64,aW1hZ2U="
    assert request.tag_names == ["클리어슬라임", "레시피"]


def test_post_create_validates_required_fields_and_tag_limit() -> None:
    with pytest.raises(ValidationError):
        PostCreate(
            title="",
            content="본문입니다.",
            post_type="recipe",
        )

    with pytest.raises(ValidationError):
        PostCreate(
            title="제목입니다.",
            content="본문입니다.",
            post_type="unknown",
        )

    with pytest.raises(ValidationError):
        PostCreate(
            title="제목입니다.",
            content="본문입니다.",
            post_type="recipe",
            tag_names=[f"태그{i}" for i in range(9)],
        )

    with pytest.raises(ValidationError):
        PostCreate(
            title="제목입니다.",
            content="본문입니다.",
            post_type="recipe",
            image_url="ftp://example.com/image.png",
        )


def test_post_update_allows_partial_payload() -> None:
    request = PostUpdate(
        title="딸기향 투명 슬라임 레시피 수정",
        image_url="https://example.com/slime.jpg",
        tag_names=["클리어슬라임", "향료", "초보자추천"],
    )

    assert request.title == "딸기향 투명 슬라임 레시피 수정"
    assert request.content is None
    assert request.post_type is None
    assert request.image_url == "https://example.com/slime.jpg"
    assert request.tag_names == ["클리어슬라임", "향료", "초보자추천"]


def test_make_post_summary_trims_long_content() -> None:
    content = "가" * 90

    assert make_post_summary("  짧은 본문입니다.  ") == "짧은 본문입니다."
    assert make_post_summary(content) == f"{'가' * 80}..."


def test_post_to_response_calculates_frontend_fields(db: Session) -> None:
    user = create_user(db)
    clear_tag = Tag(name="클리어슬라임", tag_type="slime_type")
    recipe_tag = Tag(name="레시피", tag_type="purpose")
    post = Post(
        author_id=user.id,
        title="클리어 슬라임 레시피",
        content="본문입니다.",
        post_type="recipe",
        slime_type="클리어슬라임",
        image_url="https://example.com/slime.png",
        tags=[clear_tag, recipe_tag],
    )
    first_comment = Comment(
        post=post,
        author_id=user.id,
        content="첫 댓글입니다.",
    )
    second_comment = Comment(
        post=post,
        author_id=user.id,
        content="두 번째 댓글입니다.",
    )

    db.add_all([post, first_comment, second_comment])
    db.commit()
    db.refresh(post)

    response = post_to_response(post, current_user_id=user.id)
    data = response.model_dump()

    assert data["id"] == post.id
    assert data["summary"] == "본문입니다."
    assert data["image_url"] == "https://example.com/slime.png"
    assert data["tags"] == ["클리어슬라임", "레시피"]
    assert data["author"]["email"] == "slime@example.com"
    assert data["comment_count"] == 2
    assert data["is_owner"] is True
    assert data["created_at"] == post.created_at
    assert data["updated_at"] == post.updated_at


def test_post_to_response_marks_non_owner_and_list_response(db: Session) -> None:
    author = create_user(db)
    viewer = create_user(db, email="viewer@example.com")
    post = Post(
        author_id=author.id,
        title="버터 슬라임 후기",
        content="생각보다 부드럽게 나왔어요.",
        post_type="review",
    )

    db.add(post)
    db.commit()
    db.refresh(post)

    item = post_to_response(post, current_user_id=viewer.id)
    response = PostListResponse(
        items=[item],
        page=1,
        size=10,
        total=1,
        total_pages=1,
    )

    assert item.is_owner is False
    assert response.items[0].title == "버터 슬라임 후기"
    assert response.total_pages == 1
