"""개발용 seed 연습 대상.

세션 06에서 태그 모델과 서비스가 생긴 뒤 초기 태그 데이터를 연결한다.
"""

from sqlalchemy.orm import Session

from app.services.tag_service import seed_initial_tags


# 개발용 초기 데이터를 넣는 진입점이다.
# 지금 단계에서는 초기 태그 목록만 보장한다.
def seed_database(db: Session) -> None:
    seed_initial_tags(db)
