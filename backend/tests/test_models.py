from collections.abc import Generator

import pytest
from sqlalchemy import create_engine, func, inspect, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.models import Comment, Post, Tag, User, post_tags
from app.services.auth_service import hash_password


@pytest.fixture()
def engine() -> Generator[Engine, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    try:
        yield engine
    finally:
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db(engine: Engine) -> Generator[Session, None, None]:
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


def test_session_05_tables_are_created(engine: Engine) -> None:
    table_names = set(inspect(engine).get_table_names())

    assert {"posts", "comments", "tags", "post_tags"}.issubset(table_names)


def test_post_model_matches_current_frontend_write_form(db: Session) -> None:
    user = create_user(db)
    post = Post(
        author_id=user.id,
        title="실패한 클리어 슬라임 질문",
        content="액티베이터를 넣었는데 계속 손에 묻어요.",
        post_type="failure",
        slime_type="클리어슬라임",
    )

    db.add(post)
    db.commit()
    db.refresh(post)

    column_names = set(Post.__table__.columns.keys())

    assert post.id is not None
    assert post.author.nickname == "말랑이"
    assert post.title == "실패한 클리어 슬라임 질문"
    assert post.content == "액티베이터를 넣었는데 계속 손에 묻어요."
    assert post.post_type == "failure"
    assert post.slime_type == "클리어슬라임"
    assert "ingredients" not in column_names
    assert "ratio" not in column_names
    assert "steps" not in column_names
    assert "symptom" not in column_names


def test_comment_belongs_to_post_and_author(db: Session) -> None:
    user = create_user(db)
    post = Post(
        author_id=user.id,
        title="버터 슬라임 후기",
        content="생각보다 부드럽게 나왔어요.",
        post_type="review",
    )
    comment = Comment(
        post=post,
        author_id=user.id,
        content="다음엔 색소를 조금 줄여볼게요.",
    )

    db.add_all([post, comment])
    db.commit()
    db.refresh(comment)

    assert comment.post.title == "버터 슬라임 후기"
    assert comment.author.email == "slime@example.com"
    assert post.comments[0].content == "다음엔 색소를 조금 줄여볼게요."


def test_post_and_tag_use_many_to_many_relationship(db: Session) -> None:
    user = create_user(db)
    clear_tag = Tag(name="클리어슬라임", tag_type="slime_type")
    recipe_tag = Tag(name="레시피", tag_type="custom")
    first_post = Post(
        author_id=user.id,
        title="첫 번째 레시피",
        content="본문입니다.",
        post_type="recipe",
        tags=[clear_tag, recipe_tag],
    )
    second_post = Post(
        author_id=user.id,
        title="두 번째 레시피",
        content="본문입니다.",
        post_type="recipe",
        tags=[clear_tag],
    )

    db.add_all([first_post, second_post])
    db.commit()
    db.refresh(clear_tag)
    db.refresh(first_post)

    assert {tag.name for tag in first_post.tags} == {"클리어슬라임", "레시피"}
    assert {post.title for post in clear_tag.posts} == {"첫 번째 레시피", "두 번째 레시피"}
    assert db.execute(select(func.count()).select_from(post_tags)).scalar_one() == 3


def test_deleting_post_removes_comments_and_tag_links(db: Session) -> None:
    user = create_user(db)
    tag = Tag(name="실패해결", tag_type="custom")
    post = Post(
        author_id=user.id,
        title="끈적임 해결 질문",
        content="계속 손에 묻어요.",
        post_type="failure",
        tags=[tag],
    )
    comment = Comment(
        post=post,
        author_id=user.id,
        content="액티베이터를 소량씩 추가해보세요.",
    )

    db.add_all([post, comment])
    db.commit()

    db.delete(post)
    db.commit()

    assert db.query(Post).count() == 0
    assert db.query(Comment).count() == 0
    assert db.query(Tag).count() == 1
    assert db.execute(select(func.count()).select_from(post_tags)).scalar_one() == 0
