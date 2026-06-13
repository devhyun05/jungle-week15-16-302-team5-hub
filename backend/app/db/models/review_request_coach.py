# ForeignKey는 리뷰 요청과 코치 사용자를 각각 참조하기 위해 사용한다.
from sqlalchemy import BigInteger, ForeignKey
# Mapped/mapped_column은 ORM 컬럼 선언, relationship은 양쪽 모델 객체 접근에 사용한다.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 모든 SQLAlchemy 모델의 공통 부모다.
from app.db.base import Base


# review_request_coaches는 review_requests와 users(coach)의 N:M 연결 테이블이다.
# 요청 하나를 여러 코치에게 보낼 수 있고, 코치 한 명도 여러 요청을 받을 수 있다.
class ReviewRequestCoach(Base):
    # 실제 테이블 이름이다.
    __tablename__ = "review_request_coaches"

    # 연결할 리뷰 요청 id다. coach_id와 묶어 복합 PK로 사용한다.
    review_request_id: Mapped[int] = mapped_column(ForeignKey("review_requests.id"), primary_key=True)
    # 연결할 코치 사용자 id다. 같은 요청이 같은 코치에게 중복 배정되는 것을 복합 PK가 막는다.
    coach_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)

    # ReviewRequestCoach -> ReviewRequest 관계다.
    review_request: Mapped["ReviewRequest"] = relationship(back_populates="review_request_coaches")
    # ReviewRequestCoach -> User 관계다. 여기서 User는 코치 역할의 사용자다.
    coach: Mapped["User"] = relationship(back_populates="review_request_coaches")
