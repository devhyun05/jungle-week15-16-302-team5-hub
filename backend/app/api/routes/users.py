from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import MyActivityResponse
from app.services.user_service import get_my_activity


router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me/activity", response_model=MyActivityResponse)
def my_activity_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_my_activity(db, current_user)
