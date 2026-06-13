from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, OptionalCurrentUser
from app.db.session import get_db
from app.schemas.comment import CommentCreate, CommentResponse
from app.services import comment_service

router = APIRouter(prefix="/posts/{post_id}/comments", tags=["comments"])


@router.get("", response_model=list[CommentResponse])
def read_comments(
    post_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: OptionalCurrentUser,
) -> list[CommentResponse]:
    return comment_service.get_comments(
        db,
        post_id=post_id,
        current_user=current_user,
    )


@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: int,
    comment_data: CommentCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: CurrentUser,
) -> CommentResponse:
    return comment_service.create_comment(
        db,
        post_id=post_id,
        comment_data=comment_data,
        writer=current_user,
    )


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    post_id: int,
    comment_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: CurrentUser,
) -> Response:
    comment_service.delete_comment(
        db,
        post_id=post_id,
        comment_id=comment_id,
        current_user=current_user,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
