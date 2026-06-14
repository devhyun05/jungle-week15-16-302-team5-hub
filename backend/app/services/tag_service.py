"""태그 서비스 연습 대상.

세션 06, 09에서 초기 태그와 게시글-태그 교체를 구현한다.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Tag, post_tags
from app.schemas.tag import PopularTagResponse


# 앱을 처음 켰을 때 기본으로 넣어둘 추천 태그 목록이다.
# 글쓰기 화면의 추천 태그와 게시판 필터 후보가 된다.
INITIAL_TAGS: list[dict[str, str]] = [
    {"name": "클리어슬라임", "tag_type": "slime_type"},
    {"name": "버터슬라임", "tag_type": "slime_type"},
    {"name": "클라우드슬라임", "tag_type": "slime_type"},
    {"name": "플러피슬라임", "tag_type": "slime_type"},
    {"name": "액티베이터", "tag_type": "ingredient"},
    {"name": "글루", "tag_type": "ingredient"},
    {"name": "끈적임", "tag_type": "symptom"},
    {"name": "분리됨", "tag_type": "symptom"},
    {"name": "레시피", "tag_type": "purpose"},
    {"name": "실패해결", "tag_type": "purpose"},
]


# 사용자가 직접 입력한 태그명을 DB에 저장하기 좋은 형태로 정리한다.
# 예: " # 클리어 슬라임 " -> "클리어슬라임"
def normalize_tag_name(name: str) -> str:
    normalized = name.strip()

    if normalized.startswith("#"):
        normalized = normalized[1:]

    normalized = "".join(normalized.split())

    return normalized


# 개발용 초기 태그를 tags 테이블에 넣는다.
# 이미 같은 이름의 태그가 있으면 중복으로 만들지 않는다.
def seed_initial_tags(db: Session) -> None:
    for tag_data in INITIAL_TAGS:
        existing_tag = (
            db.query(Tag)
            .filter(Tag.name == tag_data["name"])
            .first()
        )

        if existing_tag is None:
            tag = Tag(
                name=tag_data["name"],
                tag_type=tag_data["tag_type"],
            )
            db.add(tag)

    db.commit()


# /tags API에서 사용할 태그 목록을 조회한다.
# tag_type이 들어오면 해당 종류만 필터링하고, 없으면 전체를 반환한다.
def list_tags(db: Session, tag_type: str | None = None) -> list[Tag]:
    query = db.query(Tag)

    if tag_type is not None:
        query = query.filter(Tag.tag_type == tag_type)

    return (
        query
        .order_by(Tag.tag_type.asc(), Tag.name.asc())
        .all()
    )


# /tags/popular API에서 사용할 인기 태그 목록을 조회한다.
# post_tags 연결 수를 세고, 많이 쓰인 순서와 이름 순서로 정렬한다.
def list_popular_tags(db: Session, limit: int = 12) -> list[PopularTagResponse]:
    count_label = func.count(post_tags.c.post_id).label("count")

    rows = (
        db.query(
            Tag.id,
            Tag.name,
            Tag.tag_type,
            count_label,
        )
        .outerjoin(
            post_tags,
            Tag.id == post_tags.c.tag_id,
        )
        .group_by(
            Tag.id,
            Tag.name,
            Tag.tag_type,
        )
        .order_by(
            count_label.desc(),
            Tag.name.asc(),
        )
        .limit(limit)
        .all()
    )

    return [
        PopularTagResponse(
            id=row.id,
            name=row.name,
            tag_type=row.tag_type,
            count=row.count,
        )
        for row in rows
    ]
