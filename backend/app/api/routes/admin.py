from fastapi import APIRouter, Depends

from app.api.deps import require_admin
from app.models.user import User


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/health")
def admin_health(
    current_user: User = Depends(require_admin),
):
    return {
        "status": "ok",
        "admin_user_id": current_user.id,
    }