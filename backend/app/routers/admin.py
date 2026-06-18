from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.dependencies.auth import require_roles
from app.schemas.admin import AdminUserItemResponse, AdminUserListResponse, AdminUserUpdateRequest
from app.services import admin_user_service


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=AdminUserListResponse)
def get_admin_users(
    approval_status: str | None = Query(default=None, alias="approvalStatus"),
    role: str | None = Query(default=None),
    keyword: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_roles("ADMIN")),
) -> AdminUserListResponse:
    """
    ADMIN 전용 사용자 승인 관리 목록을 반환한다.
    """

    return admin_user_service.get_admin_users(
        db=db,
        approval_status=approval_status,
        role=role,
        keyword=keyword,
        page=page,
        size=size,
    )


@router.patch("/users/{user_id}", response_model=AdminUserItemResponse)
def update_admin_user(
    user_id: int,
    request: AdminUserUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_roles("ADMIN")),
) -> AdminUserItemResponse:
    """
    ADMIN이 사용자 역할과 승인 상태를 변경한다.
    """

    try:
        user = admin_user_service.update_admin_user(
            db=db,
            user_id=user_id,
            request=request,
            actor=current_admin,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    return user
