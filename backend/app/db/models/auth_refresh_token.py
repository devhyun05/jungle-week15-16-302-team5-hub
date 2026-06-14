# refresh token 만료/폐기 시각을 저장하기 위해 datetime 타입을 사용한다.
from datetime import datetime

# BigInteger는 주요 PK/FK, DateTime은 만료/폐기/생성 시각,
# ForeignKey는 users와 self reference 연결, String은 해시와 접속 환경 정보,
# func는 DB 기준 now() 기본값에 사용한다.
from sqlalchemy import BigInteger, DateTime, ForeignKey, String, func
# Mapped/mapped_column은 ORM 컬럼 선언, relationship은 User와 객체 관계를 만든다.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 모든 SQLAlchemy 모델의 공통 부모다.
from app.db.base import Base


# auth_refresh_tokens 테이블 모델이다.
# Google OAuth 로그인 후 발급한 JungleLog refresh token을 관리한다.
class AuthRefreshToken(Base):
    # 실제 DB 테이블 이름이다.
    __tablename__ = "auth_refresh_tokens"

    # refresh token row 고유 id다.
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 어떤 사용자의 refresh token인지 users.id를 참조한다.
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    # refresh token 원문은 저장하지 않고 sha256 같은 해시 결과만 저장한다.
    # 해시값으로 토큰 재사용/폐기 여부를 찾기 때문에 unique와 index를 둔다.
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    # 이 refresh token을 언제까지 사용할 수 있는지 저장한다.
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    # 로그아웃, 강제 만료, refresh token rotation 때 폐기된 시각이다.
    # None이면 아직 폐기되지 않은 토큰이다.
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # refresh token rotation을 할 때 새 토큰 id를 연결해 재사용 공격을 추적할 수 있게 한다.
    replaced_by_token_id: Mapped[int | None] = mapped_column(
        ForeignKey("auth_refresh_tokens.id"),
        nullable=True,
    )
    # 같은 사용자의 여러 브라우저/기기를 구분하기 위한 보조 정보다.
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # 접속 IP를 남겨 비정상 refresh 시도를 추적할 수 있게 한다. IPv6까지 고려해 45자로 둔다.
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    # refresh token row 생성 시각이다.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # AuthRefreshToken -> User 관계다.
    # token.user.email처럼 토큰 소유 사용자에 접근할 수 있다.
    user: Mapped["User"] = relationship(back_populates="refresh_tokens")
    # self reference 관계다.
    # token.replaced_by를 보면 이 토큰을 대체한 새 refresh token을 따라갈 수 있다.
    replaced_by: Mapped["AuthRefreshToken | None"] = relationship(remote_side=[id])
