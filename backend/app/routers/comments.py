"""댓글 라우터 연습 대상.

세션 10에서 구현할 것:
- `GET /posts/{post_id}/comments`
- `POST /posts/{post_id}/comments`
- `PATCH /comments/{comment_id}`
- `DELETE /comments/{comment_id}`
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Comment, Post, User
from app.schemas.comment import (
    CommentAuthorResponse,
    CommentCreate,
    CommentListResponse,
    CommentResponse,
    CommentUpdate,
)
from app.services.auth_service import get_current_user, get_optional_current_user

router = APIRouter()


# DB Comment 객체를 프론트 응답 CommentResponse로 바꾼다.
# is_owner는 DB 컬럼이 아니라 현재 로그인 사용자와 댓글 작성자를 비교해서 계산한다.
def comment_to_response(
    comment: Comment,
    current_user_id: int | None = None,
) -> CommentResponse:
    return CommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        content=comment.content,
        author=CommentAuthorResponse.model_validate(comment.author),
        is_owner=current_user_id is not None and comment.author_id == current_user_id,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


# 게시글 상세 페이지의 댓글 목록 API다.
# 게시글이 없으면 404, 있으면 해당 post_id의 댓글들을 오래된 순서로 내려준다.
@router.get(
    "/posts/{post_id}/comments",
    response_model=CommentListResponse,
)
def read_comments(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
) -> CommentListResponse:
    post = db.query(Post).filter(Post.id == post_id).first()

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc(), Comment.id.asc())
        .all()
    )

    current_user_id = current_user.id if current_user is not None else None

    return CommentListResponse(
        items=[
            comment_to_response(comment, current_user_id=current_user_id)
            for comment in comments
        ],
    )


# 댓글 작성 API다.
# 로그인한 사용자만 작성할 수 있고, 작성자는 access token의 current_user에서 가져온다.
@router.post(
    "/posts/{post_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment_endpoint(
    post_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CommentResponse:
    post = db.query(Post).filter(Post.id == post_id).first()

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    comment = Comment(
        post_id=post_id,
        author_id=current_user.id,
        content=comment_data.content,
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment_to_response(comment, current_user_id=current_user.id)


# 댓글 수정 API다.
# 댓글이 없으면 404, 작성자가 아니면 403, 작성자이면 content만 수정한다.
@router.patch(
    "/comments/{comment_id}",
    response_model=CommentResponse,
)
def update_comment_endpoint(
    comment_id: int,
    comment_data: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CommentResponse:
    comment = db.query(Comment).filter(Comment.id == comment_id).first()

    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found",
        )

    if comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    comment.content = comment_data.content

    db.commit()
    db.refresh(comment)

    return comment_to_response(comment, current_user_id=current_user.id)


# 댓글 삭제 API다.
# 댓글이 없으면 404, 작성자가 아니면 403, 작성자이면 삭제 후 204를 반환한다.
@router.delete(
    "/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_comment_endpoint(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    comment = db.query(Comment).filter(Comment.id == comment_id).first()

    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found",
        )

    if comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    db.delete(comment)
    db.commit()
