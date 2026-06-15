from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.post import PostCreateRequest, PostPageResponse, PostResponse, PostUpdateRequest
from app.services.post_service import create_post, list_posts, get_post, update_post, delete_post


router = APIRouter(prefix="/api/posts", tags=["posts"])


@router.post("/", response_model=PostResponse, status_code=201)
def create_post_endpoint(
    post_request: PostCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_post(db, post_request, current_user)


@router.get("/", response_model=PostPageResponse)
def list_posts_endpoint(
    q: str | None = Query(None),
    tag: str | None = Query(None),
    tags: list[str] | None = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    return list_posts(db, q=q, tag=tag, tags=tags, page=page, size=size)


@router.get("/{post_id}", response_model=PostResponse)
def get_post_endpoint(
    post_id: int,
    db: Session = Depends(get_db),
):
    return get_post(db, post_id)


@router.put("/{post_id}", response_model=PostResponse)
def update_post_endpoint(
    post_id: int,
    update_request: PostUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_post(db, post_id, update_request, current_user)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post_endpoint(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_post(db, post_id, current_user)
