from sqlalchemy.orm import Session

from app.db.models import Post, User
from app.repositories import post_repository
from app.schemas.post import PostCreateRequest, PostDetailResponse, PostListItemResponse, PostListResponse, PostUpdateRequest


ROLE_ADMIN = "ADMIN"


def build_summary_from_content(content: str) -> str:
    """
    요약이 비어 있을 때 본문 앞부분으로 목록용 요약을 만든다.
    """

    return " ".join(content.split())[:150]


def normalize_tag_names(tags: list[str]) -> list[str]:
    """
    태그 입력값에서 공백, 빈 값, 중복을 제거한다.
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


def can_manage_post(current_user: User, author_id: int) -> bool:
    """
    게시글 수정/삭제 권한을 확인한다.

    작성자 본인은 자기 글을 관리할 수 있고, ADMIN은 모든 글을 관리할 수 있다.
    """

    return current_user.id == author_id or current_user.role == ROLE_ADMIN


def create_post(db: Session, request: PostCreateRequest, current_user: User) -> PostDetailResponse | None:
    """
    현재 로그인 사용자를 작성자로 사용해 게시글을 생성한다.
    """

    title = request.title.strip()
    content = request.content.strip()

    if not title or not content:
        raise ValueError("제목과 본문을 입력해 주세요.")

    category = post_repository.get_category_by_slug(
        db=db,
        category_slug=request.category_slug,
    )

    if category is None:
        return None

    summary = request.summary.strip() if request.summary else build_summary_from_content(content)
    related_commit = request.related_commit.strip() if request.related_commit else None
    tag_names = normalize_tag_names(request.tags)

    post = post_repository.create_post(
        db=db,
        author=current_user,
        category=category,
        title=title,
        summary=summary,
        content=content,
        tag_names=tag_names,
        is_public=request.is_public,
        related_commit=related_commit,
    )

    return build_post_detail_response(post=post, comment_count=0)


def update_post(
    db: Session,
    post_id: int,
    request: PostUpdateRequest,
    current_user: User,
) -> PostDetailResponse | None:
    """
    작성자 본인 또는 ADMIN만 게시글을 수정할 수 있게 처리한다.
    """

    title = request.title.strip()
    content = request.content.strip()

    if not title or not content:
        raise ValueError("제목과 본문을 입력해 주세요.")

    post = post_repository.get_post_for_update(db=db, post_id=post_id)

    if post is None:
        return None

    if not can_manage_post(current_user=current_user, author_id=post.author_id):
        raise PermissionError("게시글을 수정할 권한이 없습니다.")

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


def delete_post(db: Session, post_id: int, current_user: User) -> bool:
    """
    작성자 본인 또는 ADMIN만 게시글을 soft delete 할 수 있게 처리한다.
    """

    post = post_repository.get_post_for_update(db=db, post_id=post_id)

    if post is None:
        return False

    if not can_manage_post(current_user=current_user, author_id=post.author_id):
        raise PermissionError("게시글을 삭제할 권한이 없습니다.")

    post_repository.soft_delete_post(db=db, post=post)

    return True


def get_posts(
    db: Session,
    category: str | None,
    keyword: str | None,
    page: int,
    size: int,
) -> PostListResponse:
    """
    공개 게시글 목록 API 응답을 만든다.
    """

    posts, total, comment_counts = post_repository.list_posts(
        db=db,
        category=category,
        keyword=keyword,
        page=page,
        size=size,
    )

    return PostListResponse(
        items=[
            build_post_list_item(
                post=post,
                comment_count=comment_counts.get(post.id, 0),
            )
            for post in posts
        ],
        total=total,
        page=page,
        size=size,
    )


def get_my_posts(
    db: Session,
    current_user: User,
    category: str | None,
    keyword: str | None,
    visibility: str,
    page: int,
    size: int,
) -> PostListResponse:
    """
    현재 로그인 사용자가 작성한 게시글 목록 API 응답을 만든다.
    """

    posts, total, comment_counts = post_repository.list_posts_by_author(
        db=db,
        author_id=current_user.id,
        category=category,
        keyword=keyword,
        visibility=visibility,
        page=page,
        size=size,
    )

    return PostListResponse(
        items=[
            build_post_list_item(
                post=post,
                comment_count=comment_counts.get(post.id, 0),
            )
            for post in posts
        ],
        total=total,
        page=page,
        size=size,
    )


def get_post_detail(
    db: Session,
    post_id: int,
    current_user: User | None,
) -> PostDetailResponse | None:
    """
    게시글 상세 API 응답을 만든다.

    공개글은 누구나 볼 수 있고, 비공개글은 작성자 본인 또는 ADMIN만 볼 수 있다.
    """

    post, comment_count = post_repository.get_accessible_post_by_id(
        db=db,
        post_id=post_id,
        current_user=current_user,
    )

    if post is None:
        return None

    return build_post_detail_response(post=post, comment_count=comment_count)


def build_post_detail_response(post: Post, comment_count: int) -> PostDetailResponse:
    """
    SQLAlchemy Post model을 게시글 상세 API 응답으로 바꾼다.
    """

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
    SQLAlchemy Post model을 프론트엔드가 쓰기 좋은 게시글 목록 item으로 바꾼다.
    """

    return PostListItemResponse(
        id=post.id,
        title=post.title,
        summary=post.summary,
        category=post.category.label,
        category_slug=post.category.slug,
        tags=[post_tag.tag.name for post_tag in post.post_tags],
        author=post.author.name,
        author_id=post.author_id,
        author_role=post.author.role,
        is_public=post.is_public,
        views=post.view_count,
        comments=comment_count,
        created_at=post.created_at,
    )
