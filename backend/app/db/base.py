# DeclarativeBase는 SQLAlchemy ORM 모델들이 상속받는 기본 클래스다.
# 이 클래스를 상속한 모델들은 Base.metadata에 테이블 설계 정보가 모인다.
from sqlalchemy.orm import DeclarativeBase


# 모든 SQLAlchemy 모델의 공통 부모 클래스다.
# 예: class User(Base), class Post(Base)처럼 모든 테이블 모델이 이 Base를 상속한다.
class Base(DeclarativeBase):
    # 현재는 공통 설정을 추가하지 않으므로 pass만 둔다.
    # 나중에 모든 모델에 공통 메서드나 naming convention이 필요하면 여기에 넣을 수 있다.
    pass
