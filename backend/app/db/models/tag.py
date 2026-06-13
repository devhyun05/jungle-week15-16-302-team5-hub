# 태그 생성/수정 시간을 저장하기 위해 datetime 타입을 사용한다.
from datetime import datetime

# BigInteger는 태그 id, DateTime은 시간, String은 태그 이름/slug,
# func는 now() 기본값에 사용한다.
from sqlalchemy import BigInteger, DateTime, String, func
# Mapped/mapped_column은 ORM 컬럼 선언, relationship은 post_tags와 연결한다.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 모든 SQLAlchemy 모델의 공통 부모다.
from app.db.base import Base


# tags 테이블 모델이다.
# 태그는 여러 게시글에서 재사용되는 기준 데이터다.
class Tag(Base):
    # 실제 테이블 이름이다.
    __tablename__ = "tags"

    # 태그 고유 id다.
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 화면에 보여줄 태그 이름이다. 예: FastAPI
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    # 코드/검색/URL에서 사용할 태그 고유 문자열이다. 예: fastapi
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    # 태그 생성 시각이다.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # 태그 수정 시각이다.
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Tag -> PostTag 목록 관계다. 실제 게시글 연결은 post_tags를 통해 찾는다.
    post_tags: Mapped[list["PostTag"]] = relationship(back_populates="tag")
