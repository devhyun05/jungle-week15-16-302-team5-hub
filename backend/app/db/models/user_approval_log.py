# 승인 이력 생성 시간을 저장하기 위해 datetime 타입을 사용한다.
from datetime import datetime

# BigInteger는 사용자/이력 id, DateTime은 생성 시각,
# ForeignKey는 users.id 참조, String은 action/role/status,
# Text는 사유, func는 now() 기본값에 사용한다.
from sqlalchemy import BigInteger, DateTime, ForeignKey, String, Text, func
# Mapped/mapped_column은 ORM 컬럼 선언, relationship은 users와 객체 관계를 만든다.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 모든 SQLAlchemy 모델의 공통 부모다.
from app.db.base import Base


# user_approval_logs 테이블 모델이다.
# 관리자가 사용자 권한/승인 상태를 바꾼 이력을 저장한다.
class UserApprovalLog(Base):
    # 실제 테이블 이름이다.
    __tablename__ = "user_approval_logs"

    # 승인 이력 고유 id다.
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 권한/승인 상태가 바뀐 대상 사용자 id다.
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    # 변경을 실행한 관리자 id다. 초기 관리자 자동 생성처럼 실행자가 없으면 None일 수 있다.
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    # 이력 종류다. 예: APPROVE, REJECT, SUSPEND, BOOTSTRAP_ADMIN
    action: Mapped[str] = mapped_column(String(30), nullable=False)
    # 변경 전 role이다. 최초 설정이면 없을 수 있다.
    before_role: Mapped[str | None] = mapped_column(String(20), nullable=True)
    # 변경 후 role이다.
    after_role: Mapped[str] = mapped_column(String(20), nullable=False)
    # 변경 전 승인 상태다. 최초 설정이면 없을 수 있다.
    before_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    # 변경 후 승인 상태다.
    after_status: Mapped[str] = mapped_column(String(20), nullable=False)
    # 관리자가 남긴 변경 사유다.
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 이력이 생성된 시각이다.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # UserApprovalLog -> User 관계다. 이력의 대상 사용자다.
    # user_id와 actor_id가 모두 users.id를 참조하므로 foreign_keys를 명시한다.
    user: Mapped["User"] = relationship(
        back_populates="approval_logs",
        foreign_keys=[user_id],
    )
    # UserApprovalLog -> User 관계다. 이력을 실행한 관리자다.
    # actor_id는 nullable이라 시스템 자동 처리 이력에서는 None일 수 있다.
    actor: Mapped["User | None"] = relationship(
        back_populates="approval_actions",
        foreign_keys=[actor_id],
    )
