from sqlalchemy import select

import app.db.models
from app.db.base import Base
from app.db.models import PostCategory
from app.db.session import SessionLocal, engine


DEFAULT_POST_CATEGORIES = (
    {"slug": "learning-log", "label": "학습 로그"},
    {"slug": "troubleshooting", "label": "트러블슈팅"},
    {"slug": "retrospective", "label": "프로젝트 회고"},
    {"slug": "interview", "label": "면접 질문"},
    {"slug": "portfolio", "label": "포트폴리오 관리"},
)


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


def seed_post_categories() -> None:
    with SessionLocal() as db:
        existing_slugs = set(db.scalars(select(PostCategory.slug)).all())

        for category in DEFAULT_POST_CATEGORIES:
            if category["slug"] not in existing_slugs:
                db.add(PostCategory(**category))

        db.commit()


def init_db() -> None:
    create_tables()
    seed_post_categories()
