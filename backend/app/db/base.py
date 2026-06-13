"""SQLAlchemy 선언형 Base 연습 대상.

세션 01에서 모든 모델이 함께 사용할 `Base` 클래스를 구현한다.
"""

from sqlalchemy.orm import DeclarativeBase
class Base(DeclarativeBase):
    pass