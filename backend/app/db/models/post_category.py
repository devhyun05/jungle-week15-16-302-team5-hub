# 카테고리 생성/수정 시간을 저장하기 위해 datetime 타입을 사용한다.
from datetime import datetime

# DateTime은 시간, Integer는 작은 기준 테이블 PK, String은 slug/label,
# func는 DB now() 기본값에 사용한다.
from sqlalchemy import DateTime, Integer, String, func
# Mapped/mapped_column은 ORM 컬럼 선언, relationship은 posts/review_requests와 연결한다.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 모든 SQLAlchemy 모델의 공통 부모다.
from app.db.base import Base


# post_categories 테이블 모델이다.
# 게시글에 문자열 카테고리를 직접 저장하지 않고 기준 테이블로 분리한 것이다.
class PostCategory(Base):
    # 실제 테이블 이름이다.
    __tablename__ = "post_categories"

    # 카테고리 고유 id다. 카테고리는 적은 기준 데이터라 Integer를 쓴다.
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # 코드/URL에서 쓰는 고유 값이다. 예: learning-log
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    # 화면에 보여줄 이름이다. 예: 학습 로그
    label: Mapped[str] = mapped_column(String(50), nullable=False)
    # 카테고리 생성 시각이다.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # 카테고리 수정 시각이다.
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # PostCategory -> Post 목록 관계다. 반대편 Post.category와 연결된다.
    posts: Mapped[list["Post"]] = relationship(back_populates="category")
    # PostCategory -> ReviewRequest 목록 관계다. 리뷰 요청도 카테고리를 가진다.
    review_requests: Mapped[list["ReviewRequest"]] = relationship(back_populates="category")
