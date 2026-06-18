from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.dependencies.auth import get_current_approved_user, get_optional_current_user
from app.schemas.comment import CommentCreateRequest, CommentItemResponse, CommentListResponse
from app.services import comment_service


router = APIRouter(tags=["comments"])


@router.get("/posts/{post_id}/comments", response_model=CommentListResponse)
def get_comments(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
) -> CommentListResponse:
    """
    접근 가능한 게시글의 댓글 목록을 반환한다.

    공개글 댓글은 비로그인 사용자도 볼 수 있고,
    비공개글 댓글은 작성자 본인 또는 ADMIN만 볼 수 있다.
    """

    comments = comment_service.get_comments_by_post_id(
        post_id=post_id,
        db=db,
        current_user=current_user,
    )

    if comments is None:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")

    return comments


@router.post(
    "/posts/{post_id}/comments",
    response_model=CommentItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    post_id: int,
    request: CommentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_approved_user),
) -> CommentItemResponse:
    """
    현재 로그인 사용자를 작성자로 사용해 댓글을 작성한다.
    """

    try:
        comment = comment_service.create_comment_for_post(
            db=db,
            post_id=post_id,
            request=request,
            current_user=current_user,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if comment is None:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")

    return comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_approved_user),
) -> None:
    """
    댓글 작성자 본인 또는 ADMIN만 댓글을 soft delete 처리한다.
    """

    try:
        deleted = comment_service.delete_comment(
            db=db,
            comment_id=comment_id,
            current_user=current_user,
        )
    except PermissionError as error:
        raise HTTPException(status_code=403, detail=str(error)) from error

    if not deleted:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없습니다.")
