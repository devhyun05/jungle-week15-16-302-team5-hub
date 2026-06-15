"""게시글 서비스 연습 대상.

세션 07, 08, 09에서 응답 변환, 검색/페이징, 게시글 쓰기 도우미를 구현한다.
"""

from math import ceil

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models import Post
from app.models.tag import Tag
from app.schemas.post import (
    PostAuthorResponse,
    PostCreate,
    PostListResponse,
    PostResponse,
    PostUpdate,
)
from app.services.tag_service import get_or_create_tags, normalize_tag_name

SUMMARY_MAX_LENGTH = 80


# 게시글 목록 카드에 보여줄 짧은 요약문을 만든다.
# 본문이 길면 앞부분만 남기고 말줄임표를 붙인다.
def make_post_summary(content: str, max_length: int = SUMMARY_MAX_LENGTH) -> str:
    summary = content.strip()

    if len(summary) <= max_length:
        return summary

    return f"{summary[:max_length].rstrip()}..."


# SQLAlchemy Post 객체를 프론트가 바로 쓰는 응답 스키마로 바꾼다.
# 태그 이름, 댓글 수, 작성자 여부처럼 DB 컬럼 그대로가 아닌 값을 함께 계산한다.
def post_to_response(
    post: Post,
    current_user_id: int | None = None,
) -> PostResponse:
    return PostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        summary=make_post_summary(post.content),
        post_type=post.post_type,
        slime_type=post.slime_type,
        image_url=post.image_url,
        tags=[tag.name for tag in post.tags],
        author=PostAuthorResponse.model_validate(post.author),
        comment_count=len(post.comments),
        is_owner=current_user_id is not None and post.author_id == current_user_id,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


# `tag=레시피`와 `tags=레시피&tags=클리어슬라임`을 하나의 필터 목록으로 합친다.
# 태그명은 저장 규칙과 맞게 정규화하고, 같은 태그가 두 번 들어오면 한 번만 남긴다.
def build_tag_filters(
    tag: str | None = None,
    tags: list[str] | None = None,
) -> list[str]:
    raw_tag_names: list[str] = []

    if tag is not None:
        raw_tag_names.append(tag)

    if tags is not None:
        raw_tag_names.extend(tags)

    normalized_tag_names: list[str] = []

    for raw_tag_name in raw_tag_names:
        normalized_tag_name = normalize_tag_name(raw_tag_name)

        if normalized_tag_name and normalized_tag_name not in normalized_tag_names:
            normalized_tag_names.append(normalized_tag_name)

    return normalized_tag_names


# 게시판 메인 목록을 만든다.
# query 조건을 차례로 얹고, 최종 개수와 현재 페이지 items를 PostListResponse로 변환한다.
def list_posts(
    db: Session,
    page: int = 1,
    size: int = 10,
    keyword: str | None = None,
    post_type: str | None = None,
    tag: str | None = None,
    tags: list[str] | None = None,
    slime_type: str | None = None,
    current_user_id: int | None = None,
) -> PostListResponse:
    query = db.query(Post)

    if keyword is not None and keyword.strip():
        keyword_like = f"%{keyword.strip()}%"

        # 제목, 본문, 슬라임 타입, 태그명 중 하나라도 검색어를 포함하면 목록에 남긴다.
        # 태그 검색 때문에 tags 테이블을 outer join하고, 같은 글이 중복되지 않게 distinct를 붙인다.
        query = (
            query
            .outerjoin(Post.tags)
            .filter(
                or_(
                    Post.title.ilike(keyword_like),
                    Post.content.ilike(keyword_like),
                    Post.slime_type.ilike(keyword_like),
                    Tag.name.ilike(keyword_like),
                )
            )
            .distinct()
        )

    if post_type is not None:
        query = query.filter(Post.post_type == post_type)

    if slime_type is not None:
        query = query.filter(Post.slime_type == slime_type)

    # tag 단일 query와 tags 반복 query를 합친 뒤, 선택한 태그 중 하나라도 있으면 남긴다.
    tag_names = build_tag_filters(tag=tag, tags=tags)
    if tag_names:
        query = query.filter(Post.tags.any(Tag.name.in_(tag_names)))

    total = query.count()
    total_pages = ceil(total / size) if total > 0 else 0

    posts = (
        query
        .order_by(Post.created_at.desc(), Post.id.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    return PostListResponse(
        items=[
            post_to_response(post, current_user_id=current_user_id)
            for post in posts
        ],
        page=page,
        size=size,
        total=total,
        total_pages=total_pages,
    )


# 상세 페이지에서 사용할 게시글 하나를 찾는다.
# 없는 글인지 판단하고 404로 바꾸는 일은 HTTP 계층인 router에서 담당한다.
def get_post_by_id(db: Session, post_id: int) -> Post | None:
    return db.query(Post).filter(Post.id == post_id).first()


# 글쓰기 요청 body와 현재 로그인 사용자 id로 새 게시글을 만든다.
# Post row를 만들고, tag_names를 Tag 객체 목록으로 바꿔 연결한 뒤 DB에 저장한다.
def create_post(
    db: Session,
    post_data: PostCreate,
    author_id: int,
) -> Post:
    post = Post(
        author_id=author_id,
        title=post_data.title,
        content=post_data.content,
        post_type=post_data.post_type,
        slime_type=post_data.slime_type,
        image_url=post_data.image_url,
    )

    post.tags = get_or_create_tags(db, post_data.tag_names)

    db.add(post)
    db.commit()
    db.refresh(post)

    return post


# 수정 요청 body로 기존 게시글을 부분 수정한다.
# None이 아닌 필드만 바꾸고, tag_names가 들어온 경우에만 태그 연결을 새 목록으로 교체한다.
def update_post(
    db: Session,
    post: Post,
    post_data: PostUpdate,
) -> Post:
    if post_data.title is not None:
        post.title = post_data.title

    if post_data.content is not None:
        post.content = post_data.content

    if post_data.post_type is not None:
        post.post_type = post_data.post_type

    if post_data.slime_type is not None:
        post.slime_type = post_data.slime_type

    if "image_url" in post_data.model_fields_set:
        post.image_url = post_data.image_url

    if post_data.tag_names is not None:
        post.tags = get_or_create_tags(db, post_data.tag_names)

    db.commit()
    db.refresh(post)

    return post


# 게시글을 DB에서 삭제한다.
# comments는 Post 모델의 cascade 설정으로 함께 정리되고, post_tags 연결도 관계에서 같이 정리된다.
def delete_post(
    db: Session,
    post: Post,
) -> None:
    db.delete(post)
    db.commit()
