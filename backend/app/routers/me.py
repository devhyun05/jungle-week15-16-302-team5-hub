from typing import Literal
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import User
from app.db.session import get_db
from app.dependencies.auth import get_current_approved_user
from app.repositories import user_repository
from app.schemas.auth import CurrentUserResponse
from app.schemas.post import PostListResponse
from app.services import auth_service, post_service


router = APIRouter(prefix="/me", tags=["me"])

ALLOWED_PROFILE_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


@router.get("/posts", response_model=PostListResponse)
def get_my_posts(
    category: str | None = Query(default=None),
    keyword: str | None = Query(default=None),
    visibility: Literal["all", "public", "private"] = Query(default="all"),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=50, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_approved_user),
) -> PostListResponse:
    """
    현재 로그인 사용자가 작성한 게시글 목록을 반환한다.
    """

    return post_service.get_my_posts(
        db=db,
        current_user=current_user,
        category=category,
        keyword=keyword,
        visibility=visibility,
        page=page,
        size=size,
    )


@router.patch("/profile", response_model=CurrentUserResponse)
async def update_my_profile(
    name: str = Form(..., min_length=1, max_length=50),
    profile_image: UploadFile | None = File(default=None, alias="profileImage"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_approved_user),
) -> CurrentUserResponse:
    """
    현재 로그인 사용자의 표시 이름과 프로필 이미지를 수정한다.

    이미지는 로컬 개발 기준으로 backend/uploads/profiles에 저장하고,
    응답에는 브라우저가 접근할 수 있는 /uploads/... 경로를 내려준다.
    """

    cleaned_name = name.strip()

    if not cleaned_name:
        raise HTTPException(status_code=400, detail="이름을 입력해주세요.")

    profile_image_url: str | None = None

    if profile_image is not None and profile_image.filename:
        if profile_image.content_type not in ALLOWED_PROFILE_IMAGE_TYPES:
            raise HTTPException(status_code=400, detail="jpg, png, webp, gif 이미지만 업로드할 수 있습니다.")

        file_bytes = await profile_image.read()

        if len(file_bytes) > 2 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="프로필 이미지는 2MB 이하로 업로드해주세요.")

        upload_root = Path(settings.upload_dir)

        if not upload_root.is_absolute():
            upload_root = Path(__file__).resolve().parents[2] / upload_root

        upload_root = upload_root / "profiles"
        upload_root.mkdir(parents=True, exist_ok=True)
        extension = ALLOWED_PROFILE_IMAGE_TYPES[profile_image.content_type]
        file_name = f"user-{current_user.id}-{uuid4().hex}{extension}"
        file_path = upload_root / file_name

        file_path.write_bytes(file_bytes)
        profile_image_url = f"/uploads/profiles/{file_name}"

    updated_user = user_repository.update_user_profile(
        db=db,
        user=current_user,
        name=cleaned_name,
        profile_image_url=profile_image_url,
    )

    return auth_service.build_current_user_response(user=updated_user)
