from datetime import datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db.models import User, UserApprovalLog


def list_users(
    db: Session,
    approval_status: str | None,
    role: str | None,
    keyword: str | None,
    page: int,
    size: int,
) -> tuple[list[User], int]:
    """
    관리자 화면에서 볼 사용자 목록을 조회한다.

    일반 서비스 화면과 달리 ADMIN은 승인 대기/거절/정지 사용자를 모두 관리해야 하므로
    approval_status와 role을 선택 필터로만 사용한다.
    """

    filters = []

    if approval_status:
        filters.append(User.approval_status == approval_status)

    if role:
        filters.append(User.role == role)

    if keyword:
        keyword_like = f"%{keyword}%"
        filters.append(
            or_(
                User.name.ilike(keyword_like),
                User.email.ilike(keyword_like),
                User.role.ilike(keyword_like),
                User.approval_status.ilike(keyword_like),
            )
        )

    total = db.scalar(
        select(func.count())
        .select_from(User)
        .where(*filters)
    ) or 0

    users = list(
        db.scalars(
            select(User)
            .where(*filters)
            .order_by(User.created_at.desc())
            .offset((page - 1) * size)
            .limit(size)
        )
    )

    return users, total


def get_user_for_admin_update(db: Session, user_id: int) -> User | None:
    """
    관리자 승인 변경 대상 사용자를 id로 조회한다.
    """

    return db.scalar(select(User).where(User.id == user_id))


def get_user_name(db: Session, user_id: int | None) -> str | None:
    """
    approved_by에 저장된 관리자 id를 화면 표시 이름으로 바꾼다.
    """

    if user_id is None:
        return None

    user = db.scalar(select(User).where(User.id == user_id))

    return user.name if user else None


def update_user_approval(
    db: Session,
    user: User,
    actor: User,
    role: str,
    approval_status: str,
    approval_note: str | None,
) -> User:
    """
    사용자 역할/승인 상태를 바꾸고 변경 이력을 남긴다.

    users 테이블은 현재 상태를 저장하고,
    user_approval_logs 테이블은 누가 언제 어떤 상태로 바꿨는지 감사 로그로 남긴다.
    """

    before_role = user.role
    before_status = user.approval_status

    user.role = role
    user.approval_status = approval_status
    user.approval_note = approval_note
    user.approved_by = actor.id
    user.approved_at = datetime.now(timezone.utc)

    if approval_status == "승인 완료":
        action = "APPROVE"
    elif approval_status == "거절":
        action = "REJECT"
    elif approval_status == "정지":
        action = "SUSPEND"
    else:
        action = "UPDATE"

    db.add(
        UserApprovalLog(
            user=user,
            actor=actor,
            action=action,
            before_role=before_role,
            after_role=role,
            before_status=before_status,
            after_status=approval_status,
            reason=approval_note,
        )
    )
    db.commit()
    db.refresh(user)

    return user
