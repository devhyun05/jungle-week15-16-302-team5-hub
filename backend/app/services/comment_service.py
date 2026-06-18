from sqlalchemy.orm import Session

from app.db.models import Comment, User
from app.repositories import comment_repository
from app.schemas.comment import CommentCreateRequest, CommentItemResponse, CommentListResponse


ROLE_ADMIN = "ADMIN"


def get_comments_by_post_id(
    db: Session,
    post_id: int,
    current_user: User | None,
) -> CommentListResponse | None:
    """
    게시글 댓글 목록 API 응답을 만든다.
    """

    if not comment_repository.get_accessible_post_exists(
        db=db,
        post_id=post_id,
        current_user=current_user,
    ):
        return None

    comments = comment_repository.list_comments_by_post_id(db, post_id)

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
    Comment DB model 하나를 프론트엔드가 쓰기 좋은 JSON item으로 바꾼다.
    """

    return CommentItemResponse(
        id=comment.id,
        post_id=comment.post_id,
        author=comment.author.name,
        author_id=comment.author_id,
        author_role=comment.author.role,
        author_profile_image_url=comment.author.profile_image_url,
        content=comment.content,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


def can_manage_comment(current_user: User, author_id: int) -> bool:
    """
    댓글 삭제 권한을 확인한다.

    댓글 작성자 본인과 ADMIN만 댓글을 삭제할 수 있다.
    """

    return current_user.id == author_id or current_user.role == ROLE_ADMIN


def create_comment_for_post(
    db: Session,
    post_id: int,
    request: CommentCreateRequest,
    current_user: User,
) -> CommentItemResponse | None:
    """
    현재 로그인 사용자를 작성자로 사용해 댓글을 생성한다.
    """

    if not comment_repository.get_accessible_post_exists(
        db=db,
        post_id=post_id,
        current_user=current_user,
    ):
        return None

    content = request.content.strip()

    if not content:
        raise ValueError("댓글 내용을 입력해 주세요.")

    comment = comment_repository.create_comment(
        db=db,
        post_id=post_id,
        author_id=current_user.id,
        content=content,
    )

    # create 직후 응답에는 작성자 이름/역할이 필요하므로 현재 사용자 객체를 연결한다.
    comment.author = current_user

    return build_comment_item(comment)


def delete_comment(db: Session, comment_id: int, current_user: User) -> bool:
    """
    댓글 작성자 본인 또는 ADMIN만 댓글을 soft delete 할 수 있게 처리한다.
    """

    comment = comment_repository.get_comment_for_update(db=db, comment_id=comment_id)

    if comment is None:
        return False

    if not can_manage_comment(current_user=current_user, author_id=comment.author_id):
        raise PermissionError("댓글을 삭제할 권한이 없습니다.")

    comment_repository.soft_delete_comment(db=db, comment=comment)

    return True
