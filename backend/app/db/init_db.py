# select는 DB에서 기존 데이터가 있는지 확인할 때 사용한다.
from sqlalchemy import select

# 이 import는 __init__.py에 등록된 모든 model을 SQLAlchemy Base.metadata에 올리기 위해 필요하다.
# 직접 변수로 쓰지 않더라도 create_all이 전체 model을 알게 만드는 역할을 한다.
import app.db.models
# Base는 SQLAlchemy model들의 공통 부모다. Base.metadata에 테이블 설계가 모인다.
from app.db.base import Base
# seed 데이터 생성에 필요한 model들을 가져온다.
from app.db.models import Post, PostCategory, PostTag, Tag, User
# SessionLocal은 DB 작업 단위를 만들고, engine은 실제 PostgreSQL 연결 정보를 가진다.
from app.db.session import SessionLocal, engine


# 서비스 시작 전에 기본으로 있어야 하는 게시글 카테고리 목록이다.
# DB에는 slug와 label을 저장하고, 프론트는 slug로 필터링한다.
DEFAULT_POST_CATEGORIES = (
    {"slug": "learning-log", "label": "학습 로그"},
    {"slug": "troubleshooting", "label": "트러블슈팅"},
    {"slug": "retrospective", "label": "프로젝트 회고"},
    {"slug": "interview", "label": "면접 질문"},
    {"slug": "portfolio", "label": "포트폴리오 관리"},
)

# API 조회를 바로 테스트할 수 있게 넣는 개발용 demo 게시글이다.
# 실제 서비스 데이터가 아니라 로컬 학습/QA용 seed다.
DEMO_POSTS = (
    {
        # posts.title
        "title": "FastAPI JWT 인증 구현 기록",
        # posts.summary
        "summary": "Google OAuth 이후 자체 JWT를 발급하는 흐름을 정리한 학습 기록입니다.",
        # posts.content
        "content": "Google OAuth로 사용자를 확인한 뒤 JungleLog 서버가 자체 JWT를 발급하는 흐름을 학습했습니다.",
        # post_categories.slug와 연결된다.
        "category_slug": "learning-log",
        # posts.related_commit
        "related_commit": "feat-auth-jwt-demo",
        # tags/post_tags로 분리해서 저장된다.
        "tags": ("FastAPI", "JWT", "OAuth2"),
        # posts.view_count
        "view_count": 12,
    },
    {
        # posts.title
        "title": "PostgreSQL 연결 트러블슈팅",
        # posts.summary
        "summary": "Docker PostgreSQL과 FastAPI SQLAlchemy 연결 과정에서 확인한 문제를 정리했습니다.",
        # posts.content
        "content": "DATABASE_URL, Docker port mapping, SQLAlchemy session을 하나씩 확인하며 DB 연결 문제를 해결했습니다.",
        # post_categories.slug와 연결된다.
        "category_slug": "troubleshooting",
        # posts.related_commit
        "related_commit": "fix-db-session-demo",
        # tags/post_tags로 분리해서 저장된다.
        "tags": ("PostgreSQL", "Docker", "SQLAlchemy"),
        # posts.view_count
        "view_count": 8,
    },
    {
        # posts.title
        "title": "JungleLog 프로젝트 회고",
        # posts.summary
        "summary": "React mock UI에서 FastAPI 백엔드로 넘어가며 배운 점을 정리한 회고입니다.",
        # posts.content
        "content": "프론트 mock data를 실제 DB와 API 설계로 연결하려면 화면 필드와 DB 필드를 구분해서 생각해야 합니다.",
        # post_categories.slug와 연결된다.
        "category_slug": "retrospective",
        # posts.related_commit
        "related_commit": "docs-api-design-demo",
        # tags/post_tags로 분리해서 저장된다.
        "tags": ("React", "FastAPI", "Retrospective"),
        # posts.view_count
        "view_count": 15,
    },
)


def create_tables() -> None:
    """Create PostgreSQL tables from every SQLAlchemy model registered in Base.metadata."""

    # Base.metadata.create_all은 아직 없는 테이블만 생성한다.
    # 이미 존재하는 테이블은 보통 그대로 둔다.
    Base.metadata.create_all(bind=engine)


def seed_post_categories() -> None:
    """Insert default post categories without creating duplicates."""

    # with 블록이 끝나면 DB session이 정리된다.
    with SessionLocal() as db:
        # 이미 들어간 category slug를 먼저 조회한다.
        # 여러 번 seed를 실행해도 중복 생성되지 않게 하기 위해서다.
        existing_slugs = set(db.scalars(select(PostCategory.slug)).all())

        # 기본 카테고리 목록을 하나씩 확인한다.
        for category in DEFAULT_POST_CATEGORIES:
            # 아직 없는 slug만 새로 추가한다.
            if category["slug"] not in existing_slugs:
                # PostCategory(**category)는 dict를 model 생성자 인자로 풀어 넣는 문법이다.
                db.add(PostCategory(**category))

        # add한 변경사항을 실제 DB transaction에 반영한다.
        db.commit()


def seed_demo_posts() -> None:
    """
    게시글 조회 API 학습을 위한 demo 사용자, 게시글, 태그를 넣는다.

    실제 운영 데이터가 아니라 로컬 개발과 Swagger 테스트용 데이터다.
    같은 title의 게시글이 있으면 중복으로 넣지 않는다.
    """

    # 하나의 session 안에서 demo user, post, tag, post_tag를 함께 만든다.
    with SessionLocal() as db:
        # demo 게시글을 작성할 가짜 학생 사용자를 찾는다.
        user = db.scalar(select(User).where(User.email == "demo.student@junglelog.local"))

        # 없으면 demo 학생 사용자를 새로 만든다.
        if user is None:
            user = User(
                email="demo.student@junglelog.local",
                google_sub="demo-student-google-sub",
                name="정글 학생",
                role="STUDENT",
                approval_status="승인 완료",
            )
            # session에 새 user를 추가한다.
            db.add(user)
            # flush는 commit 전이지만 DB에 INSERT를 보내 id를 받을 수 있게 한다.
            # 아래 Post(author=user)를 만들 때 user.id가 필요할 수 있어서 사용한다.
            db.flush()

        # slug로 category를 빠르게 찾기 위해 dict로 바꾼다.
        categories = {
            # key는 category.slug, value는 PostCategory 객체다.
            category.slug: category
            for category in db.scalars(select(PostCategory)).all()
        }

        # demo 게시글 목록을 하나씩 DB에 넣는다.
        for post_data in DEMO_POSTS:
            # title이 같은 demo 게시글이 이미 있으면 중복 삽입하지 않는다.
            existing_post = db.scalar(select(Post).where(Post.title == post_data["title"]))

            if existing_post is not None:
                continue

            # Post model 객체를 만든다.
            # author와 category에는 id가 아니라 관계 객체를 넣어도 SQLAlchemy가 FK를 채운다.
            post = Post(
                author=user,
                category=categories[post_data["category_slug"]],
                title=post_data["title"],
                summary=post_data["summary"],
                content=post_data["content"],
                related_commit=post_data["related_commit"],
                view_count=post_data["view_count"],
            )

            # 새 게시글을 session에 추가한다.
            db.add(post)

            # 게시글에 연결할 태그들을 처리한다.
            for tag_name in post_data["tags"]:
                # 태그 slug는 검색/URL 친화적으로 소문자와 하이픈 형태로 만든다.
                tag_slug = tag_name.lower().replace(" ", "-")
                # 같은 slug의 태그가 이미 있는지 확인한다.
                tag = db.scalar(select(Tag).where(Tag.slug == tag_slug))

                # 없으면 새 태그를 만든다.
                if tag is None:
                    tag = Tag(name=tag_name, slug=tag_slug)
                    db.add(tag)
                    # 새 tag도 id가 필요할 수 있으므로 flush한다.
                    db.flush()

                # post_tags 연결 테이블에 들어갈 관계 객체를 추가한다.
                # 이 한 줄이 "이 게시글은 이 태그를 가진다"는 N:M 연결을 만든다.
                post.post_tags.append(PostTag(tag=tag))

        # user/post/tag/post_tag 변경사항을 실제 DB에 반영한다.
        db.commit()


def init_db() -> None:
    """Run database initialization tasks in the correct order."""

    # 먼저 SQLAlchemy model 기준으로 테이블을 만든다.
    create_tables()
    # post를 넣기 전에 category가 있어야 하므로 카테고리를 먼저 넣는다.
    seed_post_categories()
    # demo post는 user/category/tag/post_tag를 사용하므로 마지막에 넣는다.
    seed_demo_posts()
