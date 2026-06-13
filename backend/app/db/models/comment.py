# 댓글 작성/수정/삭제 시간을 저장하기 위해 datetime 타입을 사용한다.
from datetime import datetime

# BigInteger는 큰 정수 PK/FK, DateTime은 시간, ForeignKey는 다른 테이블 참조,
# Text는 길이가 유동적인 댓글 본문, func는 DB 함수 now()를 쓰기 위해 필요하다.
from sqlalchemy import BigInteger, DateTime, ForeignKey, Text, func
# Mapped는 ORM 필드 타입 힌트, mapped_column은 실제 DB 컬럼 선언,
# relationship은 FK로 연결된 다른 모델 객체에 접근하게 해준다.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 모든 모델은 Base를 상속해야 Base.metadata에 테이블 설계가 등록된다.
from app.db.base import Base


# comments 테이블을 표현하는 SQLAlchemy 모델이다.
class Comment(Base):
    # 실제 PostgreSQL 테이블 이름이다.
    __tablename__ = "comments"

    # 댓글 고유 id다. bigint PK이며 자동 증가한다.
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 이 댓글이 달린 게시글 id다. posts.id를 참조한다.
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), nullable=False, index=True)
    # 댓글 작성자 id다. users.id를 참조한다.
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    # 댓글 본문이다. 댓글 길이는 유동적이라 Text를 쓴다.
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # 댓글 생성 시각이다. DB의 now()를 기본값으로 사용한다.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # 댓글 수정 시각이다. row가 update될 때 now()로 갱신된다.
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    # soft delete용 삭제 시각이다. None이면 삭제되지 않은 댓글이다.
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Comment -> Post 방향 관계다. 반대편 Post.comments와 연결된다.
    post: Mapped["Post"] = relationship(back_populates="comments")
    # Comment -> User 방향 관계다. 반대편 User.comments와 연결된다.
    author: Mapped["User"] = relationship(back_populates="comments")
