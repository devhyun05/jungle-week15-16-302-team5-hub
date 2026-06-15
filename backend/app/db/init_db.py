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
    """
    SQLAlchemy 모델 기준으로 아직 없는 DB 테이블을 생성한다.

    Notes:
        Base.metadata에는 app.db.models import 과정에서 모든 모델 클래스가 등록된다.
        이미 존재하는 테이블은 create_all이 보통 그대로 둔다.
    """

    Base.metadata.create_all(bind=engine)


def seed_post_categories() -> None:
    """
    게시판 기본 카테고리를 중복 없이 저장한다.

    Notes:
        로그인 사용자, 개발용 샘플 게시글, 개발용 샘플 댓글은 만들지 않는다.
        실제 서비스 데이터는 Google OAuth 로그인 후 사용자 행동으로 생성되어야 한다.
    """

    with SessionLocal() as db:
        existing_slugs = set(db.scalars(select(PostCategory.slug)).all())

        for category in DEFAULT_POST_CATEGORIES:
            if category["slug"] not in existing_slugs:
                db.add(PostCategory(**category))

        db.commit()


def init_db() -> None:
    """
    JungleLog가 동작하는 데 필요한 최소 DB 초기화를 실행한다.

    Notes:
        AI 연결 전 실제 서비스 흐름에서는 개발용 사용자를 자동 생성하지 않는다.
        최초 사용자는 Google OAuth 로그인으로 생성되고, 관리자가 승인한다.
    """

    create_tables()
    seed_post_categories()
