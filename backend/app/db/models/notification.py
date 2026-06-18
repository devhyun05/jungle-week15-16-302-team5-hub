# 알림 생성 시간을 저장하기 위해 datetime 타입을 사용한다.
from datetime import datetime

# BigInteger는 큰 정수 id, Boolean은 읽음 여부, DateTime은 생성 시각,
# ForeignKey는 사용자 연결, String은 짧은 문자열, func는 now() 기본값에 사용한다.
from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, func
# Mapped/mapped_column은 ORM 컬럼 선언, relationship은 users와 객체 관계를 만든다.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 모든 SQLAlchemy 모델의 공통 부모다.
from app.db.base import Base


# notifications 테이블을 표현하는 모델이다.
class Notification(Base):
    # 실제 테이블 이름이다.
    __tablename__ = "notifications"

    # 알림 고유 id다.
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 알림을 받을 사용자 id다. users.id를 참조한다.
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    # 알림 종류다. 예: feedback, portfolio, ai
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    # 알림 드롭다운에 보여줄 짧은 문구다.
    message: Mapped[str] = mapped_column(String(255), nullable=False)
    # 알림 클릭 시 이동할 주소다. 없는 알림도 있을 수 있어 nullable이다.
    link_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # 읽음 여부다. 처음 생성되면 읽지 않은 상태 false로 둔다.
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    # 알림 생성 시각이다.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Notification -> User 방향 관계다. 반대편 User.notifications와 연결된다.
    user: Mapped["User"] = relationship(back_populates="notifications")
