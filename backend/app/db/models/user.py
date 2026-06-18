# 사용자 생성/수정/로그인/승인 시간을 저장하기 위해 datetime 타입을 사용한다.
from datetime import datetime

# BigInteger는 사용자 id 같은 큰 정수, DateTime은 시간,
# ForeignKey는 자기 자신을 포함한 다른 테이블 참조,
# String은 이메일/이름/상태 같은 짧은 문자열, Text는 승인 메모,
# func는 DB now() 기본값에 사용한다.
from sqlalchemy import BigInteger, DateTime, ForeignKey, String, Text, func
# Mapped/mapped_column은 ORM 컬럼 선언, relationship은 다른 모델과 객체 관계를 만든다.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 모든 SQLAlchemy 모델의 공통 부모다.
from app.db.base import Base


# users 테이블 모델이다.
# Google OAuth로 로그인한 학생/코치/관리자를 모두 저장한다.
class User(Base):
    # 실제 테이블 이름이다.
    __tablename__ = "users"

    # 사용자 고유 id다. 다른 거의 모든 테이블에서 이 값을 FK로 참조한다.
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # Google 계정 이메일이다. 중복 로그인을 막기 위해 unique다.
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    # Google OAuth의 고유 사용자 식별자다. 이메일보다 안정적인 로그인 기준이다.
    google_sub: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    # JungleLog 안에서 보여줄 표시 이름이다.
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    # Google 프로필 이미지 URL이다. 없을 수 있어 nullable이다.
    profile_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # 사용자 역할이다. STUDENT, COACH, ADMIN 같은 값이 들어간다.
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="STUDENT")
    # 서비스 사용 승인 상태다. 승인 대기, 승인 완료, 거절, 정지 같은 값이 들어간다.
    approval_status: Mapped[str] = mapped_column(String(20), nullable=False, default="승인 대기")
    # 마지막 로그인 시각이다.
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # 이 사용자를 승인한 관리자 id다. users.id를 다시 참조하는 self FK다.
    approved_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    # 승인 처리 시각이다.
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # 승인/거절/정지 관련 현재 메모다.
    approval_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 사용자 row 생성 시각이다.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # 사용자 정보 수정 시각이다.
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # User -> Post 목록 관계다. 사용자가 작성한 게시글들이다.
    posts: Mapped[list["Post"]] = relationship(back_populates="author")
    # User -> Comment 목록 관계다. 사용자가 작성한 댓글들이다.
    comments: Mapped[list["Comment"]] = relationship(back_populates="author")
    # User -> PortfolioProject 목록 관계다. 학생이 등록한 포트폴리오 프로젝트들이다.
    portfolio_projects: Mapped[list["PortfolioProject"]] = relationship(back_populates="owner")
    # User -> ReviewRequest 목록 관계다. 학생이 요청한 코치 리뷰들이다.
    review_requests: Mapped[list["ReviewRequest"]] = relationship(back_populates="requester")
    # User -> ReviewRequestCoach 목록 관계다. 코치에게 배정된 리뷰 요청 연결들이다.
    review_request_coaches: Mapped[list["ReviewRequestCoach"]] = relationship(back_populates="coach")
    # User -> Notification 목록 관계다. 사용자에게 온 알림들이다.
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user")
    # User -> AuthRefreshToken 목록 관계다. 로그인한 브라우저/기기별 refresh token 기록이다.
    refresh_tokens: Mapped[list["AuthRefreshToken"]] = relationship(back_populates="user")
    # 이 사용자가 승인/거절/정지 대상이었던 이력들이다.
    # UserApprovalLog에는 user_id와 actor_id가 둘 다 users.id를 보므로 foreign_keys를 지정해야 한다.
    approval_logs: Mapped[list["UserApprovalLog"]] = relationship(
        back_populates="user",
        foreign_keys="UserApprovalLog.user_id",
    )
    # 이 사용자가 관리자로서 실행한 승인/거절/정지 이력들이다.
    # actor_id가 실행자 관리자 id다.
    approval_actions: Mapped[list["UserApprovalLog"]] = relationship(
        back_populates="actor",
        foreign_keys="UserApprovalLog.actor_id",
    )
