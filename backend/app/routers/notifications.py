from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.dependencies.auth import get_current_approved_user
from app.schemas.notification import NotificationItemResponse, NotificationListResponse
from app.services import notification_service


router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse)
def get_notifications(
    size: int = Query(default=10, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_approved_user),
) -> NotificationListResponse:
    """
    현재 로그인 사용자의 최근 알림 목록을 반환한다.
    """

    return notification_service.get_my_notifications(
        db=db,
        current_user=current_user,
        size=size,
    )


@router.patch("/{notification_id}/read", response_model=NotificationItemResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_approved_user),
) -> NotificationItemResponse:
    """
    알림 하나를 읽음 상태로 변경한다.
    """

    notification = notification_service.mark_my_notification_read(
        db=db,
        current_user=current_user,
        notification_id=notification_id,
    )

    if notification is None:
        raise HTTPException(status_code=404, detail="알림을 찾을 수 없습니다.")

    return notification


@router.patch("/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_approved_user),
) -> None:
    """
    현재 로그인 사용자의 모든 알림을 읽음 상태로 변경한다.
    """

    notification_service.mark_all_my_notifications_read(
        db=db,
        current_user=current_user,
    )


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_approved_user),
) -> None:
    """
    현재 로그인 사용자의 알림 하나를 목록에서 제거한다.
    """

    is_deleted = notification_service.delete_my_notification(
        db=db,
        current_user=current_user,
        notification_id=notification_id,
    )

    if not is_deleted:
        raise HTTPException(status_code=404, detail="알림을 찾을 수 없습니다.")
