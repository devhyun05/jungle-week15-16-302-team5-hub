from sqlalchemy.orm import Session

from app.db.models import Comment
from app.repositories import comment_repository
from app.schemas.comment import CommentItemResponse, CommentListResponse

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