# 게시글 생성/수정/삭제 시간을 저장하기 위해 datetime 타입을 사용한다.
from datetime import datetime

# BigInteger는 큰 정수 PK/FK, Boolean은 공개 여부, DateTime은 시간,
# ForeignKey는 다른 테이블 참조, Integer는 조회수/category_id,
# String은 제목, Text는 본문/요약, func는 now() 기본값에 사용한다.
from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, String, Text, func
# Mapped/mapped_column은 ORM 컬럼 선언, relationship은 연결된 모델 객체 접근에 사용한다.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 모든 SQLAlchemy 모델의 공통 부모다.
from app.db.base import Base


# posts 테이블 모델이다.
# 게시판 목록/상세/작성/수정의 중심 데이터다.
class Post(Base):
    # 실제 테이블 이름이다.
    __tablename__ = "posts"

    # 게시글 고유 id다. /posts/{post_id}에서 쓰인다.
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 작성자 id다. users.id를 참조한다.
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    # 카테고리 id다. post_categories.id를 참조한다.
    category_id: Mapped[int] = mapped_column(ForeignKey("post_categories.id"), nullable=False, index=True)
    # 게시글 제목이다.
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    # 게시글 목록에서 보여줄 요약이다. 없어도 되므로 nullable이다.
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 게시글 본문이다. 길어질 수 있어 Text를 쓴다.
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # GitHub 커밋 메모/해시 등 연결 정보를 임시로 저장하는 필드다.
    related_commit: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 공개 여부다. v1 목록 API는 공개 글만 조회한다.
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    # 조회수다. API 응답에서는 views라는 이름으로 바꿔 내려준다.
    view_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # 게시글 생성 시각이다.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # 게시글 수정 시각이다.
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    # soft delete용 삭제 시각이다. None이면 삭제되지 않은 게시글이다.
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Post -> User 관계다. post.author.name처럼 작성자에 접근할 수 있다.
    author: Mapped["User"] = relationship(back_populates="posts")
    # Post -> PostCategory 관계다. post.category.slug처럼 카테고리에 접근할 수 있다.
    category: Mapped["PostCategory"] = relationship(back_populates="posts")
    # Post -> Comment 목록 관계다.
    comments: Mapped[list["Comment"]] = relationship(back_populates="post")
    # Post -> PostTag 목록 관계다. 실제 태그는 post_tags를 거쳐 찾는다.
    post_tags: Mapped[list["PostTag"]] = relationship(back_populates="post")
    # Post -> PortfolioProjectPost 목록 관계다. 프로젝트와 게시글의 N:M 연결이다.
    portfolio_project_posts: Mapped[list["PortfolioProjectPost"]] = relationship(back_populates="post")
    # Post -> ReviewRequest 목록 관계다. 게시글이 코치 리뷰 대상일 수 있다.
    review_requests: Mapped[list["ReviewRequest"]] = relationship(back_populates="target_post")
