# func는 count 같은 SQL 함수를 쓸 때 필요하다.
# or_는 여러 검색 조건 중 하나라도 맞으면 조회되게 만든다.
# select는 SQL SELECT 문을 Python 코드로 만드는 SQLAlchemy 함수다.
from sqlalchemy import delete, func, or_, select
# Session은 DB 연결 작업 단위 타입이다.
# selectinload는 관계 데이터를 미리 가져와서 반복 조회를 줄인다.
from sqlalchemy.orm import Session, selectinload

# DB 테이블을 Python 클래스로 표현한 SQLAlchemy model들이다.
from app.db.models import Comment, Post, PostCategory, PostTag, Tag, User


DEMO_POST_AUTHOR_EMAIL = "demo.student@junglelog.local"


def build_tag_slug(tag_name: str) -> str:
    """
    화면에서 입력한 태그 이름을 DB에서 중복 판단에 쓰기 쉬운 slug로 바꾼다.

    Args:
        tag_name: 사용자가 입력한 태그 이름.

    Returns:
        소문자와 하이픈 중심의 tag slug.
    """

    return tag_name.strip().lower().replace(" ", "-")[:50]


def get_demo_post_author(db: Session) -> User | None:
    """
    JWT/OAuth2 구현 전까지 게시글 작성에 사용할 demo 사용자를 조회한다.

    실제 인증이 붙으면 이 함수는 current_user dependency로 대체된다.
    """

    return db.scalar(
        select(User).where(User.email == DEMO_POST_AUTHOR_EMAIL)
    )


def get_category_by_slug(db: Session, category_slug: str) -> PostCategory | None:
    """
    프론트에서 보낸 categorySlug에 맞는 기준 카테고리를 찾는다.
    """

    return db.scalar(
        select(PostCategory).where(PostCategory.slug == category_slug)
    )


def get_or_create_tag(db: Session, tag_name: str) -> Tag:
    """
    태그가 이미 있으면 재사용하고, 없으면 새로 만든다.

    게시글과 태그는 N:M 관계라 tags 테이블에 기준 태그를 만들고,
    post_tags 연결 테이블로 게시글과 이어준다.
    """

    normalized_name = tag_name.strip()[:50]
    tag_slug = build_tag_slug(normalized_name)
    tag = db.scalar(select(Tag).where(Tag.slug == tag_slug))

    if tag is not None:
        return tag

    tag = Tag(name=normalized_name, slug=tag_slug)
    db.add(tag)
    db.flush()

    return tag


def create_post(
    db: Session,
    author: User,
    category: PostCategory,
    title: str,
    summary: str | None,
    content: str,
    tag_names: list[str],
    is_public: bool,
    related_commit: str | None,
) -> Post:
    """
    posts, tags, post_tags 테이블에 게시글 작성 결과를 저장한다.

    Args:
        db: SQLAlchemy session.
        author: 게시글 작성자 User model.
        category: 게시글 카테고리 PostCategory model.
        title: 게시글 제목.
        summary: 목록에 보여줄 요약.
        content: 게시글 본문.
        tag_names: 연결할 태그 이름 목록.
        is_public: 공개 여부.
        related_commit: GitHub URL 또는 커밋 메모.

    Returns:
        DB에 저장된 Post model.
    """

    post = Post(
        author=author,
        category=category,
        title=title,
        summary=summary,
        content=content,
        is_public=is_public,
        related_commit=related_commit,
    )
    db.add(post)

    for tag_name in tag_names:
        tag = get_or_create_tag(db, tag_name)
        post.post_tags.append(PostTag(tag=tag))

    db.commit()
    db.refresh(post)

    return post


def get_post_for_update(db: Session, post_id: int) -> Post | None:
    """
    수정할 게시글을 id로 조회한다.

    상세 조회 API는 공개 글만 보여주지만, 수정 API는 나중에 작성자 본인의 비공개 글도 수정해야 한다.
    그래서 여기서는 is_public 조건을 걸지 않고 deleted_at만 확인한다.
    """

    return db.scalar(
        select(Post)
        .options(
            selectinload(Post.author),
            selectinload(Post.category),
        )
        .where(
            Post.id == post_id,
            Post.deleted_at.is_(None),
        )
    )


def update_post(
    db: Session,
    post: Post,
    category: PostCategory,
    title: str,
    summary: str | None,
    content: str,
    tag_names: list[str],
    is_public: bool,
    related_commit: str | None,
) -> Post:
    """
    posts 테이블의 본문 정보와 post_tags 연결 테이블의 태그 관계를 함께 수정한다.

    태그는 posts와 tags 사이의 N:M 관계라서 게시글 row 하나만 바꾸는 것으로 끝나지 않는다.
    현재 방식은 이해하기 쉽게 기존 post_tags 연결을 지우고, 화면에서 넘어온 태그 목록으로 다시 연결한다.
    """

    # posts 테이블에 직접 들어가는 컬럼들을 수정한다.
    post.category = category
    post.title = title
    post.summary = summary
    post.content = content
    post.is_public = is_public
    post.related_commit = related_commit

    # 기존 태그 연결을 먼저 삭제한다. delete(PostTag)는 post_tags 테이블에 DELETE SQL을 보낸다.
    db.execute(delete(PostTag).where(PostTag.post_id == post.id))
    db.flush()

    # 새 태그 이름 목록을 tags 테이블에 준비하고 post_tags 연결 row를 다시 만든다.
    for tag_name in tag_names:
        tag = get_or_create_tag(db, tag_name)
        db.add(PostTag(post_id=post.id, tag=tag))

    # commit 전까지는 위 변경이 하나의 transaction 안에 묶인다.
    # 중간에 에러가 나면 FastAPI dependency의 session 정리 과정에서 rollback된다.
    db.commit()
    db.refresh(post)

    return post


def list_posts(
    db: Session,
    category: str | None,
    keyword: str | None,
    page: int,
    size: int,
) -> tuple[list[Post], int, dict[int, int]]:
    """
    공개 게시글 목록과 댓글 수를 DB에서 조회한다.

    Args:
        db: SQLAlchemy session.
        category: 카테고리 slug 필터.
        keyword: 검색어 필터.
        page: 현재 페이지 번호.
        size: 한 페이지에 가져올 게시글 수.

    Returns:
        게시글 목록, 전체 게시글 수, 게시글별 댓글 수 dict.
    """

    # 모든 목록 조회에 기본으로 들어가는 조건이다.
    # deleted_at이 None인 글은 삭제되지 않은 글이다.
    # is_public이 True인 글만 현재 v1 공개 목록에 보여준다.
    filters = [Post.deleted_at.is_(None), Post.is_public.is_(True)]

    # category query가 있으면 post_categories.slug가 같은 글만 찾는다.
    # 예: /posts?category=learning-log
    if category:
        filters.append(PostCategory.slug == category)

    # keyword query가 있으면 여러 컬럼과 관계에서 검색한다.
    # 예: /posts?keyword=JWT
    if keyword:
        # SQL LIKE 검색은 %검색어% 형태로 "포함" 조건을 만든다.
        keyword_like = f"%{keyword}%"
        # or_(...) 안의 조건 중 하나라도 맞으면 검색 결과에 포함된다.
        filters.append(
            or_(
                # 게시글 제목 검색
                Post.title.ilike(keyword_like),
                # 게시글 요약 검색
                Post.summary.ilike(keyword_like),
                # 게시글 본문 검색
                Post.content.ilike(keyword_like),
                # 연결 커밋 문자열 검색
                Post.related_commit.ilike(keyword_like),
                # 작성자 이름 검색: posts.author 관계를 통해 users.name을 본다.
                Post.author.has(User.name.ilike(keyword_like)),
                # 카테고리 표시 이름 검색: 예 "학습 로그"
                Post.category.has(PostCategory.label.ilike(keyword_like)),
                # 카테고리 slug 검색: 예 "learning-log"
                Post.category.has(PostCategory.slug.ilike(keyword_like)),
                # 태그 이름 검색: posts -> post_tags -> tags.name
                Post.post_tags.any(PostTag.tag.has(Tag.name.ilike(keyword_like))),
                # 태그 slug 검색: posts -> post_tags -> tags.slug
                Post.post_tags.any(PostTag.tag.has(Tag.slug.ilike(keyword_like))),
            )
        )

    # pagination을 하려면 먼저 조건에 맞는 전체 개수를 알아야 한다.
    # select(func.count())는 SELECT count(*)와 비슷하다.
    total = db.scalar(
        select(func.count())
        # count 기준 테이블을 posts로 지정한다.
        .select_from(Post)
        # category 필터가 PostCategory.slug를 쓰므로 category 테이블과 join한다.
        .join(Post.category)
        # filters 리스트를 풀어서 where 조건으로 넣는다.
        .where(*filters)
    # db.scalar가 None을 줄 가능성에 대비해 0을 기본값으로 둔다.
    ) or 0

    # 실제 한 페이지에 보여줄 게시글 목록을 조회한다.
    posts = list(
        db.scalars(
            # SELECT posts
            select(Post)
            # category 필터/정렬을 위해 category와 join한다.
            .join(Post.category)
            # Post.author, Post.category, Post.post_tags.tag를 미리 로딩한다.
            # service에서 post.author.name 같은 값을 쓸 때 추가 query가 반복되는 것을 줄인다.
            .options(
                selectinload(Post.author),
                selectinload(Post.category),
                selectinload(Post.post_tags).selectinload(PostTag.tag),
            )
            # 위에서 만든 공개/삭제/카테고리/검색 조건을 적용한다.
            .where(*filters)
            # 최신 글이 먼저 보이도록 생성일 내림차순 정렬한다.
            .order_by(Post.created_at.desc())
            # page=1이면 0개 건너뛰고, page=2이면 size만큼 건너뛴다.
            .offset((page - 1) * size)
            # 한 페이지 크기만큼만 가져온다.
            .limit(size)
        )
    )

    # 목록에서 보여줄 댓글 수를 한 번에 계산한다.
    # post별로 comments를 세면 N+1 문제가 생길 수 있어서 별도 count query를 쓴다.
    comment_counts = get_comment_counts(db, [post.id for post in posts])

    # service가 응답을 조립할 수 있도록 원본 Post 목록, total, 댓글 수 dict를 반환한다.
    return posts, total, comment_counts


def get_post_by_id(db: Session, post_id: int) -> tuple[Post | None, int]:
    """
    id에 맞는 공개 게시글 하나와 댓글 수를 조회한다.

    Args:
        db: SQLAlchemy session.
        post_id: 조회할 게시글 id.

    Returns:
        게시글이 있으면 Post와 댓글 수, 없으면 None과 0.
    """

    # 상세 조회는 한 개만 필요하므로 db.scalar로 첫 번째 scalar 결과를 가져온다.
    post = db.scalar(
        # SELECT posts
        select(Post)
        # 상세 응답에 필요한 author/category/tags 관계를 미리 가져온다.
        .options(
            selectinload(Post.author),
            selectinload(Post.category),
            selectinload(Post.post_tags).selectinload(PostTag.tag),
        )
        # id가 같고, 삭제되지 않았고, 공개된 글만 찾는다.
        .where(
            Post.id == post_id,
            Post.deleted_at.is_(None),
            Post.is_public.is_(True),
        )
    )

    # 해당 id의 공개 게시글이 없으면 router에서 404로 바꿀 수 있게 None을 반환한다.
    if post is None:
        return None, 0

    # 상세 화면에도 댓글 수가 필요하므로 해당 post id의 댓글 수를 계산한다.
    comment_count = get_comment_counts(db, [post.id]).get(post.id, 0)

    # service가 상세 응답을 만들 수 있게 Post 객체와 댓글 수를 같이 반환한다.
    return post, comment_count


def get_comment_counts(db: Session, post_ids: list[int]) -> dict[int, int]:
    """
    여러 게시글 id에 대한 댓글 수를 한 번에 계산한다.

    Args:
        db: SQLAlchemy session.
        post_ids: 댓글 수를 계산할 게시글 id 목록.

    Returns:
        {게시글 id: 댓글 수} 형태의 dict.
    """

    # 조회할 게시글이 없으면 DB에 불필요한 query를 보내지 않는다.
    if not post_ids:
        return {}

    # comments 테이블에서 post_id별 댓글 개수를 계산한다.
    rows = db.execute(
        # SELECT comments.post_id, count(comments.id)
        select(Comment.post_id, func.count(Comment.id))
        # 목록에 있는 게시글 id만 대상으로 하고, 삭제되지 않은 댓글만 센다.
        .where(
            Comment.post_id.in_(post_ids),
            Comment.deleted_at.is_(None),
        )
        # post_id별로 묶어야 각 게시글의 댓글 수가 나온다.
        .group_by(Comment.post_id)
    ).all()

    # SQLAlchemy row 목록을 {post_id: count} dict로 바꿔 service가 쉽게 쓰게 한다.
    return {post_id: count for post_id, count in rows}
