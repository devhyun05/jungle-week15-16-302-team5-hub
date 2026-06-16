from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCommentResponse, UserMe, UserPostSummary
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserMe)
def read_my_profile(current_user: User = Depends(get_current_user)) -> UserMe:
    return UserMe.model_validate(current_user)


@router.get("/me/posts", response_model=UserPostSummary)
def read_my_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserPostSummary:
    return user_service.get_my_posts(db, current_user=current_user)


@router.get("/me/comments", response_model=list[UserCommentResponse])
def read_my_comments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[UserCommentResponse]:
    return user_service.get_my_comments(db, current_user=current_user)
