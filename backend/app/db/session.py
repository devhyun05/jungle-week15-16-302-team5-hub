# Generator는 get_db()가 yield를 사용하는 함수라는 타입 힌트를 표현할 때 쓴다.
from collections.abc import Generator

# create_engine은 SQLAlchemy가 PostgreSQL에 연결하는 engine을 만든다.
from sqlalchemy import create_engine
# Session은 DB 작업 단위 타입이고, sessionmaker는 Session을 찍어내는 공장 함수다.
from sqlalchemy.orm import Session, sessionmaker

# settings.database_url에 .env에서 읽은 PostgreSQL 접속 주소가 들어 있다.
from app.core.config import settings


# engine은 FastAPI 앱과 PostgreSQL 사이의 실제 연결 통로다.
# pool_pre_ping=True는 DB 연결이 끊겼는지 미리 확인해서 죽은 연결을 재사용하는 문제를 줄인다.
engine = create_engine(settings.database_url, pool_pre_ping=True)
# SessionLocal은 요청마다 사용할 DB session을 만들어주는 factory다.
# autocommit=False: commit을 직접 호출해야 DB 변경이 확정된다.
# autoflush=False: query 전에 자동 flush하지 않고, 필요한 시점에 명시적으로 처리한다.
# bind=engine: 이 session이 위에서 만든 PostgreSQL engine을 사용한다는 뜻이다.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI endpoint에 DB session을 주입하는 dependency 함수다.

    Yields:
        요청 처리 동안 사용할 SQLAlchemy Session.
    """

    # 요청 하나가 들어올 때 사용할 DB session을 만든다.
    db = SessionLocal()

    try:
        # yield로 db를 넘기면 FastAPI endpoint에서 db: Session = Depends(get_db)로 받을 수 있다.
        yield db
    finally:
        # 요청 처리가 끝나면 성공/실패와 상관없이 DB session을 닫는다.
        # 이걸 안 닫으면 연결이 계속 쌓여서 DB 연결 풀이 고갈될 수 있다.
        db.close()
