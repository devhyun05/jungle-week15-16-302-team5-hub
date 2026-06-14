from fastapi import APIRouter, Depends, HTTPException, status
# Session은 SQLAlchemy DB session 타입이다.
from sqlalchemy.orm import Session

# get_db는 요청마다 DB session을 열고 닫아주는 FastAPI dependency다.
from app.db.session import get_db
# response_model에 넣을 Pydantic schema다.
from app.schemas.comment import CommentCreateRequest, CommentItemResponse, CommentListResponse
# router는 service를 호출하고, service가 실제 응답 조립을 맡는다.
from app.services import comment_service


# 댓글 API는 posts 하위 자원처럼 보이지만, 기존 posts router와 충돌하지 않게 전체 path를 route에 직접 적는다.
router = APIRouter(tags=["comments"])


@router.get("/posts/{post_id}/comments", response_model=CommentListResponse)
def get_comments(
    # FastAPI가 URL의 {post_id} 값을 int로 변환해준다.
    post_id: int,
    # 게시글 상세 조회도 DB가 필요하므로 session을 주입받는다.
    db: Session = Depends(get_db),
) -> CommentListResponse:
    """
    특정 게시글의 댓글 목록을 반환한다.

    Args:
        post_id: 댓글을 조회할 게시글 id.
        db: FastAPI가 주입한 SQLAlchemy session.

    Returns:
        댓글 목록 응답.

    Raises:
        HTTPException: 게시글이 없으면 404를 반환한다.
    """

    # service는 게시글이 없으면 None을 반환한다.
    comments = comment_service.get_comments_by_post_id(
        post_id=post_id,
        db=db,
    )

    # None을 FastAPI HTTP 응답인 404로 바꾸는 책임은 router가 가진다.
    if comments is None:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")

    return comments


@router.post(
    "/posts/{post_id}/comments",
    response_model=CommentItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    # FastAPI가 URL의 {post_id} 값을 int로 변환해서 넣어준다.
    post_id: int,
    # POST request body의 JSON {"content": "..."}를 Pydantic schema로 검증한다.
    request: CommentCreateRequest,
    # DB INSERT가 필요하므로 SQLAlchemy session을 주입받는다.
    db: Session = Depends(get_db),
) -> CommentItemResponse:
    """
    특정 게시글에 댓글을 작성한다.

    JWT/OAuth2 전 단계라서 작성자는 demo user로 저장한다.
    인증 구현 후에는 request body가 아니라 JWT token에서 작성자를 꺼내야 한다.
    """

    try:
        comment = comment_service.create_comment_for_post(
            db=db,
            post_id=post_id,
            request=request,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

    if comment is None:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")

    return comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    # URL path의 comment_id로 어떤 댓글을 삭제 처리할지 결정한다. 예: DELETE /comments/3
    comment_id: int,
    # 댓글 삭제는 comments.deleted_at 값을 바꾸는 DB UPDATE 작업이므로 session이 필요하다.
    db: Session = Depends(get_db),
) -> None:
    """
    댓글을 soft delete 처리한다.

    실제 row를 삭제하지 않고 `deleted_at`을 채운다.
    댓글 목록 조회는 이미 `deleted_at is null` 조건을 사용하므로 삭제된 댓글은 사용자에게 보이지 않는다.
    """

    deleted = comment_service.delete_comment(db=db, comment_id=comment_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없습니다.")

