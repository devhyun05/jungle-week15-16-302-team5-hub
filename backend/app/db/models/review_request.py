# 리뷰 요청 생성/수정 시간을 저장하기 위해 datetime 타입을 사용한다.
from datetime import datetime

# BigInteger는 주요 FK/PK, DateTime은 시간, ForeignKey는 참조 관계,
# Integer는 category_id, String은 상태/대상 타입, Text는 메시지/피드백,
# func는 now() 기본값에 사용한다.
from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text, func
# Mapped/mapped_column은 ORM 컬럼 선언, relationship은 다른 모델과 객체 관계를 만든다.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 모든 SQLAlchemy 모델의 공통 부모다.
from app.db.base import Base


# review_requests 테이블 모델이다.
# 학생이 게시글 또는 포트폴리오 프로젝트에 대해 코치 리뷰를 요청할 때 저장된다.
class ReviewRequest(Base):
    # 실제 테이블 이름이다.
    __tablename__ = "review_requests"

    # 리뷰 요청 고유 id다.
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 요청한 학생 id다. users.id를 참조한다.
    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    # 리뷰 요청 카테고리 id다. post_categories.id를 참조한다.
    category_id: Mapped[int] = mapped_column(ForeignKey("post_categories.id"), nullable=False, index=True)
    # 리뷰 대상 종류다. post 또는 portfolio 같은 값을 넣는다.
    target_type: Mapped[str] = mapped_column(String(20), nullable=False)
    # 대상이 게시글이면 posts.id를 저장하고, 포트폴리오 대상이면 None이다.
    target_post_id: Mapped[int | None] = mapped_column(ForeignKey("posts.id"), nullable=True, index=True)
    # 대상이 포트폴리오면 portfolio_projects.id를 저장하고, 게시글 대상이면 None이다.
    target_project_id: Mapped[int | None] = mapped_column(ForeignKey("portfolio_projects.id"), nullable=True, index=True)
    # 학생이 코치에게 남기는 요청 메시지다.
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 리뷰 요청 상태다. 예: 대기 중, 검토 중, 피드백 완료
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="대기 중")
    # 코치가 작성한 피드백이다.
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 요청 생성 시각이다.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # 상태나 피드백 수정 시각이다.
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # ReviewRequest -> User 관계다. 요청자 정보를 가져온다.
    requester: Mapped["User"] = relationship(back_populates="review_requests")
    # ReviewRequest -> PostCategory 관계다. 요청 카테고리를 가져온다.
    category: Mapped["PostCategory"] = relationship(back_populates="review_requests")
    # ReviewRequest -> Post 관계다. target_post_id가 있을 때 사용한다.
    target_post: Mapped["Post | None"] = relationship(back_populates="review_requests")
    # ReviewRequest -> PortfolioProject 관계다. target_project_id가 있을 때 사용한다.
    target_project: Mapped["PortfolioProject | None"] = relationship(back_populates="review_requests")
    # ReviewRequest -> ReviewRequestCoach 목록 관계다. 배정된 코치들은 이 연결 테이블을 거친다.
    review_request_coaches: Mapped[list["ReviewRequestCoach"]] = relationship(back_populates="review_request")
