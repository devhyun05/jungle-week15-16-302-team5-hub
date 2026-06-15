from sqlalchemy.orm import Session

from app.db.models import User
from app.repositories import admin_user_repository, notification_repository
from app.schemas.admin import AdminUserItemResponse, AdminUserListResponse, AdminUserUpdateRequest


ROLE_ADMIN = "ADMIN"
VALID_ROLES = {"STUDENT", "COACH", "ADMIN"}
VALID_APPROVAL_STATUSES = {"승인 대기", "승인 완료", "거절", "정지"}


def get_role_label(role: str) -> str:
    labels = {
        "STUDENT": "학생",
        "COACH": "코치",
        "ADMIN": "관리자",
    }

    return labels.get(role, role)


def get_admin_users(
    db: Session,
    approval_status: str | None,
    role: str | None,
    keyword: str | None,
    page: int,
    size: int,
) -> AdminUserListResponse:
    """
    관리자 사용자 목록 응답을 만든다.
    """

    users, total = admin_user_repository.list_users(
        db=db,
        approval_status=approval_status,
        role=role,
        keyword=keyword,
        page=page,
        size=size,
    )

    return AdminUserListResponse(
        items=[build_admin_user_item(db=db, user=user) for user in users],
        total=total,
        page=page,
        size=size,
    )


def update_admin_user(
    db: Session,
    user_id: int,
    request: AdminUserUpdateRequest,
    actor: User,
) -> AdminUserItemResponse | None:
    """
    ADMIN이 사용자 역할과 승인 상태를 변경한다.
    """

    user = admin_user_repository.get_user_for_admin_update(db=db, user_id=user_id)

    if user is None:
        return None

    next_role = request.role or user.role
    next_status = request.approval_status or user.approval_status

    if next_role not in VALID_ROLES:
        raise ValueError("존재하지 않는 역할입니다.")

    if next_status not in VALID_APPROVAL_STATUSES:
        raise ValueError("존재하지 않는 승인 상태입니다.")

    # 본인 계정을 ADMIN/승인 완료 상태에서 빼면 관리자 화면에 다시 접근하지 못할 수 있다.
    if user.id == actor.id and (next_role != ROLE_ADMIN or next_status != "승인 완료"):
        raise ValueError("본인 관리자 권한은 해제하거나 정지할 수 없습니다.")

    before_role = user.role
    before_status = user.approval_status

    updated_user = admin_user_repository.update_user_approval(
        db=db,
        user=user,
        actor=actor,
        role=next_role,
        approval_status=next_status,
        approval_note=request.approval_note,
    )

    if before_role != updated_user.role or before_status != updated_user.approval_status:
        notification_repository.create_notification(
            db=db,
            user_id=updated_user.id,
            notification_type="approval",
            message=f"서비스 접근 상태가 {updated_user.approval_status}, 역할이 {get_role_label(updated_user.role)}로 변경되었습니다.",
            link_url="/" if updated_user.approval_status == "승인 완료" else "/pending-approval",
        )

    return build_admin_user_item(db=db, user=updated_user)


def build_admin_user_item(db: Session, user: User) -> AdminUserItemResponse:
    """
    User DB model을 관리자 화면용 응답 item으로 변환한다.
    """

    return AdminUserItemResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        profile_image_url=user.profile_image_url,
        role=user.role,
        approval_status=user.approval_status,
        approval_note=user.approval_note,
        requested_at=user.created_at,
        approved_at=user.approved_at,
        approved_by=admin_user_repository.get_user_name(db=db, user_id=user.approved_by),
        last_login_at=user.last_login_at,
    )
