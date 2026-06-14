"""태그 라우터 연습 대상.

세션 06에서 구현할 것:
- `GET /tags`
- `GET /tags/popular`
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.tag import PopularTagListResponse, TagListResponse
from app.services.tag_service import list_popular_tags, list_tags

router = APIRouter()


# 태그 목록 조회 API다.
# main.py에서 prefix="/tags"를 붙였기 때문에 여기의 "" 경로가 실제로는 GET /tags가 된다.
@router.get(
    "",
    response_model=TagListResponse,
)
def get_tags(
    tag_type: str | None = None,
    db: Session = Depends(get_db),
) -> TagListResponse:
    tags = list_tags(db, tag_type=tag_type)

    return TagListResponse(
        items=tags,
    )


# 인기 태그 조회 API다.
# main.py의 prefix="/tags"와 합쳐져 실제 경로는 GET /tags/popular가 된다.
@router.get(
    "/popular",
    response_model=PopularTagListResponse,
)
def get_popular_tags(
    limit: int = Query(
        default=12,
        ge=1,
        le=50,
    ),
    db: Session = Depends(get_db),
) -> PopularTagListResponse:
    popular_tags = list_popular_tags(db, limit=limit)

    return PopularTagListResponse(
        items=popular_tags,
    )
