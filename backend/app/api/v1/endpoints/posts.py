from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser
from app.db.session import get_db
from app.schemas.post import (
    PostCreate,
    PostResponse,
    PostSort,
    PostStatus,
    PostStatusUpdate,
    PostUpdate,
)
from app.services import post_service

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=list[PostResponse])
def read_posts(
    db: Annotated[Session, Depends(get_db)],
    keyword: Annotated[str | None, Query(max_length=80)] = None,
    status: PostStatus | None = None,
    sort: PostSort = "latest",
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=50)] = 20,
) -> list[PostResponse]:
    return post_service.get_posts(
        db,
        keyword=keyword,
        post_status=status,
        sort=sort,
        page=page,
        size=size,
    )


@router.get("/{post_id}", response_model=PostResponse)
def read_post(
    post_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> PostResponse:
    return post_service.get_post_detail(db, post_id=post_id)


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post_data: PostCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: CurrentUser,
) -> PostResponse:
    return post_service.create_post(
        db,
        post_data=post_data,
        seller=current_user,
    )


@router.patch("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    post_data: PostUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: CurrentUser,
) -> PostResponse:
    return post_service.update_post(
        db,
        post_id=post_id,
        post_data=post_data,
        current_user=current_user,
    )


@router.patch("/{post_id}/status", response_model=PostResponse)
def update_post_status(
    post_id: int,
    status_data: PostStatusUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: CurrentUser,
) -> PostResponse:
    return post_service.update_post_status(
        db,
        post_id=post_id,
        post_status=status_data.status,
        current_user=current_user,
    )


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: CurrentUser,
) -> Response:
    post_service.delete_post(db, post_id=post_id, current_user=current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
