from collections.abc import Generator
from pathlib import Path
import sys

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool


# 테스트를 repo root에서 실행하면 Python은 기본적으로 `backend/app`을 import path로 보지 않는다.
# `python -m pytest backend/tests`와 `cd backend && python -m pytest tests` 둘 다 되게 하려고,
# 이 conftest.py 기준으로 한 단계 위인 `backend/` 폴더를 import path에 넣는다.
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db.base import Base
from app.db.session import get_db
from app.main import app


# 테스트에서는 실제 개발용 PostgreSQL을 건드리지 않는다.
# 대신 메모리 안에만 존재하는 SQLite DB를 만들고, 테스트가 끝나면 통째로 버린다.
#
# "sqlite://"는 파일을 만들지 않는 in-memory DB다.
# StaticPool은 여러 DB session이 같은 in-memory DB 연결을 공유하게 해준다.
# FastAPI TestClient는 앱을 다른 thread에서 실행할 수 있어서,
# StaticPool과 check_same_thread=False가 없으면 "테이블을 만들었는데 못 찾는" 문제가 생길 수 있다.
test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


# SessionLocal은 "DB session을 만들어주는 공장"이었다.
# 앱의 SessionLocal은 PostgreSQL에 연결되지만, 이 테스트용 SessionLocal은 위 SQLite에 연결된다.
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    """각 테스트마다 깨끗한 DB와 FastAPI client를 준비한다.

    pytest fixture는 테스트 함수의 매개변수 이름으로 불러 쓰는 준비물이다.
    예를 들어 test 함수가 `def test_something(client):`라고 쓰면,
    pytest가 이 함수를 먼저 실행해서 client를 만들어 넣어준다.
    """

    # SQLAlchemy model class들을 보고 users/posts/sessions table을 만든다.
    # app.main import가 User/Post/UserSession model을 import하므로 metadata에 table 정보가 등록되어 있다.
    Base.metadata.create_all(bind=test_engine)

    def override_get_db() -> Generator[Session, None, None]:
        """FastAPI route가 사용할 테스트용 DB session dependency다."""

        db = TestingSessionLocal()
        try:
            # 실제 app의 get_db처럼 route 함수에 db를 잠시 빌려준다.
            yield db
        finally:
            # route 처리가 끝나면 session을 닫는다.
            db.close()

    # 앱 코드의 `Depends(get_db)`가 실제 PostgreSQL 대신 override_get_db를 쓰게 바꾼다.
    # 이 한 줄 덕분에 테스트가 실제 개발 DB 데이터를 만들거나 지우지 않는다.
    app.dependency_overrides[get_db] = override_get_db

    # TestClient는 브라우저나 curl 대신 Python 코드로 FastAPI endpoint를 호출하게 해주는 도구다.
    # context manager(`with TestClient(...)`)를 쓰면 app lifespan이 실행되어 실제 engine을 만질 수 있으므로,
    # 여기서는 직접 table을 만들고 plain TestClient를 넘겨준다.
    yield TestClient(app)

    # 다음 테스트가 이전 테스트 데이터에 영향을 받지 않도록 정리한다.
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
