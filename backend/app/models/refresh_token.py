"""
Refresh token 모델 연습 대상.

세션 02에서 로그인 유지와 토큰 회전에 쓰이는 `refresh_tokens` 테이블 모델을 구현한다.

id: refresh token row 번호
user_id: 이 토큰이 어떤 사용자의 것인지
token_hash: refresh token 원문을 hash한 값
family_id: 같은 로그인 흐름에서 이어진 token 묶음
expires_at: 만료 시간
revoked_at: 폐기된 시간, 아직 유효하면 None
replaced_by_token_id: 새 token으로 교체됐을 때 새 row id
created_at: 생성 시간
last_used_at: 마지막 사용 시간
user_agent, ip_address: 어떤 브라우저/환경에서 로그인했는지 기록용
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"  # refresh token들을 저장할 테이블 이름

    id: Mapped[int] = mapped_column(
        Integer,               # 정수 컬럼 타입
        primary_key=True,   # 기본키이므로 True
        index=True,         # id 조회를 빠르게 하기 위해 True
    )

    user_id: Mapped[int] = mapped_column(
        Integer,               # 정수 컬럼 타입
        ForeignKey("users.id", ondelete="CASCADE"),  # users.id를 참조, 사용자가 삭제되면 토큰도 삭제
        nullable=False,      # 어떤 사용자의 토큰인지 반드시 있어야 하므로 False
        index=True,         # 사용자별 토큰 조회를 자주 하므로 True
    )

    token_hash: Mapped[str] = mapped_column(
        String(255),       # 해시 문자열 저장 길이, DB SQL 기준 255
        unique=True,        # 같은 token hash 중복 금지
        nullable=False,      # 반드시 있어야 하므로 False
        index=True,         # token hash로 찾을 일이 많으므로 True
    )

    family_id: Mapped[str] = mapped_column(
        String(64),       # 같은 로그인 흐름 묶음 ID 길이, DB SQL 기준 64
        nullable=False,      # 반드시 있어야 하므로 False
        index=True,         # 재사용 공격 시 같은 family를 찾을 수 있게 True
    )

    user_agent: Mapped[str | None] = mapped_column(
        Text,               # 긴 브라우저 정보 저장용 SQLAlchemy 타입
        nullable=True,      # 없어도 되므로 True
    )

    ip_address: Mapped[str | None] = mapped_column(
        String(45),       # IPv6까지 고려한 IP 문자열 길이, DB SQL 기준 45
        nullable=True,      # 없어도 되므로 True
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),  # timezone 포함, True
        nullable=False,           # 만료 시간은 반드시 있어야 하므로 False
    )

    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),  # timezone 포함, True
        nullable=True,           # 아직 폐기 안 됐으면 None 가능
    )

    replaced_by_token_id: Mapped[int | None] = mapped_column(
        Integer,               # 정수 컬럼 타입
        ForeignKey("refresh_tokens.id", ondelete="SET NULL"),  # 같은 refresh_tokens.id 참조, 새 토큰 삭제 시 NULL
        nullable=True,      # 아직 교체 안 됐으면 None 가능
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),  # timezone 포함, True
        server_default=func.now(), # DB 현재 시간 함수
        nullable=False,            # 자동 생성되지만 필수값
    )

    last_used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),  # timezone 포함, True
        nullable=True,           # 아직 사용 안 됐으면 None 가능
    )