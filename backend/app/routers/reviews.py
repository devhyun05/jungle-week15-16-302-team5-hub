from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.dependencies.auth import get_current_approved_user, require_roles
from app.schemas.review import (
    CoachOptionListResponse,
    ReviewRequestCreateRequest,
    ReviewRequestListResponse,
    ReviewRequestResponse,
    ReviewRequestUpdateRequest,
)
from app.services import review_service


router = APIRouter(prefix="/review-requests", tags=["review-requests"])


@router.get("/coaches", response_model=CoachOptionListResponse)
def get_coach_options(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_approved_user),
) -> CoachOptionListResponse:
    """
    리뷰 요청을 보낼 수 있는 승인 완료 코치 목록을 반환한다.
    """

    return review_service.get_coach_options(db=db)


@router.post("", response_model=ReviewRequestResponse, status_code=status.HTTP_201_CREATED)
def create_review_request(
    request: ReviewRequestCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> ReviewRequestResponse:
    """
    학생이 게시글 또는 포트폴리오 프로젝트에 대한 코치 리뷰를 요청한다.
    """

    try:
        return review_service.create_review_request(
            db=db,
            request=request,
            current_user=current_user,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get("/me", response_model=ReviewRequestListResponse)
def get_my_review_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> ReviewRequestListResponse:
    """
    내가 보낸 리뷰 요청 목록을 반환한다.
    """

    return review_service.get_my_review_requests(
        db=db,
        current_user=current_user,
    )


@router.get("/inbox", response_model=ReviewRequestListResponse)
def get_review_inbox(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("COACH", "ADMIN")),
) -> ReviewRequestListResponse:
    """
    코치에게 배정된 리뷰 요청 인박스를 반환한다.
    """

    return review_service.get_review_inbox(
        db=db,
        current_user=current_user,
    )


@router.patch("/{review_request_id}", response_model=ReviewRequestResponse)
def update_review_request(
    review_request_id: int,
    request: ReviewRequestUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("COACH", "ADMIN")),
) -> ReviewRequestResponse:
    """
    코치가 리뷰 피드백과 상태를 변경한다.
    """

    try:
        review_request = review_service.update_review_request(
            db=db,
            review_request_id=review_request_id,
            request=request,
            current_user=current_user,
        )
    except PermissionError as error:
        raise HTTPException(status_code=403, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if review_request is None:
        raise HTTPException(status_code=404, detail="리뷰 요청을 찾을 수 없습니다.")

    return review_request


@router.delete("/{review_request_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_review_request(
    review_request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> None:
    """
    학생이 아직 대기 중인 리뷰 요청을 취소한다.
    """

    try:
        deleted = review_service.cancel_my_review_request(
            db=db,
            review_request_id=review_request_id,
            current_user=current_user,
        )
    except PermissionError as error:
        raise HTTPException(status_code=403, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if not deleted:
        raise HTTPException(status_code=404, detail="리뷰 요청을 찾을 수 없습니다.")
