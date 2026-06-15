from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import Notification


def create_notification(
    db: Session,
    user_id: int,
    notification_type: str,
    message: str,
    link_url: str | None = None,
) -> Notification:
    """
    사용자에게 보여줄 알림 row를 생성한다.

    알림은 리뷰 요청, 피드백, 관리자 승인처럼 이미 처리된 이벤트의 결과를 알려주는 보조 데이터다.
    """

    notification = Notification(
        user_id=user_id,
        type=notification_type,
        message=message,
        link_url=link_url,
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


def list_notifications(db: Session, user_id: int, size: int) -> list[Notification]:
    return list(
        db.scalars(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(size)
        )
    )


def count_notifications(db: Session, user_id: int) -> int:
    return db.scalar(
        select(func.count())
        .select_from(Notification)
        .where(Notification.user_id == user_id)
    ) or 0


def count_unread_notifications(db: Session, user_id: int) -> int:
    return db.scalar(
        select(func.count())
        .select_from(Notification)
        .where(
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
        )
    ) or 0


def get_notification_by_id(db: Session, notification_id: int, user_id: int) -> Notification | None:
    return db.scalar(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
    )


def mark_notification_read(db: Session, notification: Notification) -> Notification:
    notification.is_read = True
    db.commit()
    db.refresh(notification)

    return notification


def mark_all_notifications_read(db: Session, user_id: int) -> None:
    notifications = list(
        db.scalars(
            select(Notification).where(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
        )
    )

    for notification in notifications:
        notification.is_read = True

    db.commit()
