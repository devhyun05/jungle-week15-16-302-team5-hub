from sqlalchemy.orm import Session

from app.db.models import Notification, User
from app.repositories import notification_repository
from app.schemas.notification import NotificationItemResponse, NotificationListResponse


def get_my_notifications(db: Session, current_user: User, size: int) -> NotificationListResponse:
    notifications = notification_repository.list_notifications(
        db=db,
        user_id=current_user.id,
        size=size,
    )
    total = notification_repository.count_notifications(
        db=db,
        user_id=current_user.id,
    )
    unread_count = notification_repository.count_unread_notifications(
        db=db,
        user_id=current_user.id,
    )

    return NotificationListResponse(
        items=[build_notification_item(notification) for notification in notifications],
        total=total,
        unread_count=unread_count,
    )


def mark_my_notification_read(db: Session, current_user: User, notification_id: int) -> NotificationItemResponse | None:
    notification = notification_repository.get_notification_by_id(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id,
    )

    if notification is None:
        return None

    updated_notification = notification_repository.mark_notification_read(
        db=db,
        notification=notification,
    )

    return build_notification_item(updated_notification)


def mark_all_my_notifications_read(db: Session, current_user: User) -> None:
    notification_repository.mark_all_notifications_read(
        db=db,
        user_id=current_user.id,
    )


def delete_my_notification(db: Session, current_user: User, notification_id: int) -> bool:
    notification = notification_repository.get_notification_by_id(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id,
    )

    if notification is None:
        return False

    notification_repository.delete_notification(
        db=db,
        notification=notification,
    )

    return True


def build_notification_item(notification: Notification) -> NotificationItemResponse:
    return NotificationItemResponse(
        id=notification.id,
        type=notification.type,
        message=notification.message,
        link_url=notification.link_url,
        is_read=notification.is_read,
        created_at=notification.created_at,
    )
