from sqlalchemy.orm import Session

from app.db.models import Comment
from app.repositories import comment_repository
from app.schemas.comment import CommentCreateRequest, CommentItemResponse, CommentListResponse

def get_comments_by_post_id(db: Session, post_id: int) -> CommentListResponse | None:
    """
    게시글 댓글 목록 API 응답을 만든다.

    Args:
        db: SQLAlchemy session.
        post_id: 댓글을 조회할 게시글 id.

    Returns:
        게시글이 있으면 댓글 목록 응답, 게시글이 없으면 None.
    """
    # 먼저 게시글이 존재하는지 확인한다.
    # 없는 게시글의 댓글을 조회하면 router에서 404로 바꾼다.
    if not comment_repository.get_public_post_exists(db, post_id):
        return None

    # repository에서 DB 댓글 목록을 가져온다.
    comments = comment_repository.list_comments_by_post_id(db, post_id)

    # SQLAlchemy Comment model 목록을 Pydantic 응답 schema로 변환한다.
    return CommentListResponse(
        post_id=post_id,
        items=[
            build_comment_item(comment)
            for comment in comments
        ],
        total=len(comments),
    )


def build_comment_item(comment: Comment) -> CommentItemResponse:
    """
    Comment DB model 하나를 프론트가 쓰기 좋은 JSON 응답 item으로 바꾼다.

    Args:
        comment: DB에서 조회한 Comment model.

    Returns:
        댓글 응답 item.
    """

    return CommentItemResponse(
        id=comment.id,
        post_id=comment.post_id,
        author=comment.author.name,
        author_role=comment.author.role,
        content=comment.content,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


def create_comment_for_post(
    db: Session,
    post_id: int,
    request: CommentCreateRequest,
) -> CommentItemResponse | None:
    """
    댓글 작성 API의 비즈니스 흐름을 처리한다.

    Args:
        db: SQLAlchemy session.
        post_id: 댓글을 작성할 게시글 id.
        request: 프론트에서 보낸 댓글 작성 request body.

    Returns:
        게시글이 있으면 생성된 댓글 응답, 게시글이 없으면 None.

    Raises:
        ValueError: 공백만 있는 댓글이면 발생한다.
        RuntimeError: JWT 전 단계에서 사용할 demo user가 없으면 발생한다.
    """

    # 댓글은 존재하는 공개 게시글에만 작성할 수 있게 막는다.
    # 없는 게시글이면 router에서 404 응답으로 바꾼다.
    if not comment_repository.get_public_post_exists(db, post_id):
        return None

    # 프론트에서 공백 문자열을 보내도 DB에는 의미 있는 본문만 저장한다.
    content = request.content.strip()

    if not content:
        raise ValueError("댓글 내용을 입력해주세요.")

    # TODO auth: JWT/OAuth2 구현 후에는 demo user 대신 get_current_user() 결과를 사용한다.
    author = comment_repository.get_demo_comment_author(db)

    if author is None:
        raise RuntimeError("댓글 작성용 demo 사용자를 찾을 수 없습니다.")

    comment = comment_repository.create_comment(
        db=db,
        post_id=post_id,
        author_id=author.id,
        content=content,
    )

    # create 후 응답을 만들 때 작성자 이름/역할이 필요하므로 author 관계를 채워둔다.
    comment.author = author

    return build_comment_item(comment)
