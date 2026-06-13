# Session은 DB session 타입 힌트다.
from sqlalchemy.orm import Session

# Post는 SQLAlchemy DB model이다.
from app.db.models import Post
# repository는 실제 DB query를 담당한다.
from app.repositories import post_repository
# schema는 API로 내보낼 JSON 모양을 담당한다.
from app.schemas.post import PostCreateRequest, PostDetailResponse, PostListItemResponse, PostListResponse, PostUpdateRequest


def build_summary_from_content(content: str) -> str:
    """
    프론트에서 summary를 보내지 않았을 때 본문 앞부분으로 목록 요약을 만든다.
    """

    return " ".join(content.split())[:150]


def normalize_tag_names(tags: list[str]) -> list[str]:
    """
    태그 입력값에서 공백, 빈 값, 중복을 정리한다.

    Args:
        tags: 프론트에서 보낸 태그 이름 목록.

    Returns:
        DB에 연결할 태그 이름 목록.
    """

    normalized_tags: list[str] = []
    seen_slugs: set[str] = set()

    for tag in tags:
        tag_name = tag.strip()

        if not tag_name:
            continue

        tag_slug = tag_name.lower().replace(" ", "-")

        if tag_slug in seen_slugs:
            continue

        normalized_tags.append(tag_name[:50])
        seen_slugs.add(tag_slug)

    return normalized_tags


def create_post(db: Session, request: PostCreateRequest) -> PostDetailResponse | None:
    """
    게시글 작성 API의 비즈니스 흐름을 처리한다.

    Args:
        db: SQLAlchemy session.
        request: 프론트에서 보낸 게시글 작성 request body.

    Returns:
        카테고리가 있으면 생성된 게시글 상세 응답, 카테고리가 없으면 None.

    Raises:
        ValueError: 제목이나 본문이 공백이면 발생한다.
        RuntimeError: JWT 전 단계에서 사용할 demo user가 없으면 발생한다.
    """

    title = request.title.strip()
    content = request.content.strip()

    if not title or not content:
        raise ValueError("제목과 본문을 입력해주세요.")

    category = post_repository.get_category_by_slug(
        db=db,
        category_slug=request.category_slug,
    )

    if category is None:
        return None

    # TODO auth: JWT/OAuth2 구현 후에는 demo user 대신 get_current_user() 결과를 사용한다.
    author = post_repository.get_demo_post_author(db)

    if author is None:
        raise RuntimeError("게시글 작성용 demo 사용자를 찾을 수 없습니다.")

    summary = request.summary.strip() if request.summary else build_summary_from_content(content)
    related_commit = request.related_commit.strip() if request.related_commit else None
    tag_names = normalize_tag_names(request.tags)

    post = post_repository.create_post(
        db=db,
        author=author,
        category=category,
        title=title,
        summary=summary,
        content=content,
        tag_names=tag_names,
        is_public=request.is_public,
        related_commit=related_commit,
    )

    return build_post_detail_response(post=post, comment_count=0)


def update_post(db: Session, post_id: int, request: PostUpdateRequest) -> PostDetailResponse | None:
    """
    게시글 수정 API의 비즈니스 흐름을 처리한다.

    Args:
        db: SQLAlchemy session.
        post_id: URL path에서 받은 수정 대상 게시글 id.
        request: 프론트엔드 수정 폼에서 보낸 request body.

    Returns:
        수정된 게시글 상세 응답. 게시글 또는 카테고리가 없으면 None.

    Raises:
        ValueError: 제목이나 본문이 공백이면 발생한다.
    """

    title = request.title.strip()
    content = request.content.strip()

    if not title or not content:
        raise ValueError("제목과 본문을 입력해주세요.")

    post = post_repository.get_post_for_update(db=db, post_id=post_id)

    if post is None:
        return None

    # TODO auth: JWT/OAuth2 연결 후에는 post.author_id와 current_user.id를 비교해서 본인 글만 수정하게 한다.
    category = post_repository.get_category_by_slug(
        db=db,
        category_slug=request.category_slug,
    )

    if category is None:
        return None

    summary = request.summary.strip() if request.summary else build_summary_from_content(content)
    related_commit = request.related_commit.strip() if request.related_commit else None
    tag_names = normalize_tag_names(request.tags)

    updated_post = post_repository.update_post(
        db=db,
        post=post,
        category=category,
        title=title,
        summary=summary,
        content=content,
        tag_names=tag_names,
        is_public=request.is_public,
        related_commit=related_commit,
    )

    comment_count = post_repository.get_comment_counts(db, [updated_post.id]).get(updated_post.id, 0)

    return build_post_detail_response(post=updated_post, comment_count=comment_count)


def get_posts(
    db: Session,
    category: str | None,
    keyword: str | None,
    page: int,
    size: int,
) -> PostListResponse:
    """
    공개 게시글 목록 API 응답을 만든다.

    Args:
        db: SQLAlchemy session.
        category: 카테고리 slug 필터.
        keyword: 검색어 필터.
        page: 현재 페이지 번호.
        size: 한 페이지 크기.

    Returns:
        프론트가 바로 사용할 수 있는 게시글 목록 응답.
    """

    # repository에서 DB 조회 결과를 가져온다.
    # posts는 SQLAlchemy Post 객체 목록이다.
    # total은 필터 조건에 맞는 전체 개수다.
    # comment_counts는 {post_id: 댓글 수} 형태의 dict다.
    posts, total, comment_counts = post_repository.list_posts(
        db=db,
        category=category,
        keyword=keyword,
        page=page,
        size=size,
    )

    # DB model을 그대로 반환하지 않고 PostListResponse schema로 변환한다.
    return PostListResponse(
        # 각 Post 객체를 목록용 응답 item으로 변환한다.
        items=[
            build_post_list_item(
                post=post,
                # 댓글이 하나도 없으면 dict에 id가 없을 수 있으므로 기본값 0을 쓴다.
                comment_count=comment_counts.get(post.id, 0),
            )
            for post in posts
        ],
        # 페이지네이션 계산을 위해 전체 개수와 요청 page/size를 같이 내려준다.
        total=total,
        page=page,
        size=size,
    )


def get_post_detail(db: Session, post_id: int) -> PostDetailResponse | None:
    """
    게시글 상세 API 응답을 만든다.

    Args:
        db: SQLAlchemy session.
        post_id: 조회할 게시글 id.

    Returns:
        게시글이 있으면 상세 응답, 없으면 None.
    """

    # repository에서 id에 맞는 공개 게시글과 댓글 수를 가져온다.
    post, comment_count = post_repository.get_post_by_id(db, post_id)

    # repository가 못 찾았다고 알려주면 service도 None을 반환한다.
    # router가 이 None을 보고 404로 바꾼다.
    if post is None:
        return None

    return build_post_detail_response(post=post, comment_count=comment_count)


def build_post_detail_response(post: Post, comment_count: int) -> PostDetailResponse:
    """
    SQLAlchemy Post model을 게시글 상세 API 응답으로 바꾼다.

    create/detail/update API가 모두 같은 상세 응답을 반환해야 프론트엔드가 같은 타입으로 처리할 수 있다.
    그래서 공통 변환 로직을 이 함수 하나로 모았다.
    """

    # 상세 응답도 목록 응답과 공통 필드가 많다.
    # 그래서 먼저 목록 item 형태로 공통 필드를 만든 뒤 상세 전용 필드를 추가한다.
    list_item = build_post_list_item(
        post=post,
        comment_count=comment_count,
    )

    return PostDetailResponse(
        **list_item.model_dump(),
        content=post.content,
        related_commit=post.related_commit,
        updated_at=post.updated_at,
    )


def build_post_list_item(post: Post, comment_count: int) -> PostListItemResponse:
    """
    SQLAlchemy Post model을 프론트가 쓰기 좋은 목록 응답 item으로 바꾼다.

    Args:
        post: DB에서 조회한 SQLAlchemy Post 객체.
        comment_count: 해당 게시글의 댓글 수.

    Returns:
        게시글 목록 item 응답 schema.
    """

    # DB 안에서는 author_id, category_id, post_tags처럼 관계로 저장되어 있다.
    # 여기서 그 관계를 author 이름, category label, tags 배열로 풀어서 내려준다.
    return PostListItemResponse(
        # posts.id
        id=post.id,
        # posts.title
        title=post.title,
        # posts.summary
        summary=post.summary,
        # posts.category_id -> post_categories.label
        category=post.category.label,
        # posts.category_id -> post_categories.slug
        category_slug=post.category.slug,
        # posts -> post_tags -> tags.name 관계를 배열로 변환한다.
        tags=[post_tag.tag.name for post_tag in post.post_tags],
        # posts.author_id -> users.name
        author=post.author.name,
        # posts.author_id -> users.role
        author_role=post.author.role,
        # posts.is_public
        is_public=post.is_public,
        # posts.view_count를 API에서는 views로 표현한다.
        views=post.view_count,
        # comments 테이블 count 결과다.
        comments=comment_count,
        # posts.created_at
        created_at=post.created_at,
    )
