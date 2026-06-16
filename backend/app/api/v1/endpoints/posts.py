import time

from fastapi import APIRouter, Cookie, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
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

VIEWED_POSTS_COOKIE_NAME = "viewed_posts"
VIEW_COUNT_COOLDOWN_SECONDS = 24 * 60 * 60
MAX_VIEWED_POSTS_IN_COOKIE = 100


def parse_viewed_posts_cookie(cookie_value: str | None) -> dict[int, int]:
    if not cookie_value:
        return {}

    viewed_posts: dict[int, int] = {}
    for item in cookie_value.split(","):
        try:
            post_id_text, viewed_at_text = item.split(":")
            viewed_posts[int(post_id_text)] = int(viewed_at_text)
        except ValueError:
            continue

    return viewed_posts


def serialize_viewed_posts_cookie(viewed_posts: dict[int, int]) -> str:
    recent_posts = sorted(
        viewed_posts.items(),
        key=lambda item: item[1],
        reverse=True,
    )[:MAX_VIEWED_POSTS_IN_COOKIE]
    return ",".join(f"{post_id}:{viewed_at}" for post_id, viewed_at in recent_posts)


@router.get("", response_model=list[PostResponse])
def read_posts(
    db: Session = Depends(get_db),
    keyword: str | None = None,
    status: PostStatus | None = None,
    category: str | None = None,
    sort: PostSort = "latest",
    page: int = 1,
    size: int = 20,
) -> list[PostResponse]:
    return post_service.get_posts(
        db,
        keyword=keyword,
        post_status=status,
        category=category,
        sort=sort,
        page=page,
        size=size,
    )


@router.get("/{post_id}", response_model=PostResponse)
def read_post(
    post_id: int,
    response: Response,
    db: Session = Depends(get_db),
    viewed_posts_cookie: str | None = Cookie(
        default=None,
        alias=VIEWED_POSTS_COOKIE_NAME,
    ),
) -> PostResponse:
    now = int(time.time())
    viewed_posts = parse_viewed_posts_cookie(viewed_posts_cookie)
    last_viewed_at = viewed_posts.get(post_id)
    should_increase_view = (
        last_viewed_at is None
        or now - last_viewed_at >= VIEW_COUNT_COOLDOWN_SECONDS
    )

    post = post_service.get_post_detail(
        db,
        post_id=post_id,
        should_increase_view=should_increase_view,
    )

    if should_increase_view:
        viewed_posts[post_id] = now
        response.set_cookie(
            key=VIEWED_POSTS_COOKIE_NAME,
            value=serialize_viewed_posts_cookie(viewed_posts),
            httponly=True,
            samesite="lax",
            max_age=VIEW_COUNT_COOLDOWN_SECONDS,
        )

    return post


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post_data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    post_service.delete_post(db, post_id=post_id, current_user=current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{post_id}/likes", response_model=PostResponse)
def like_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostResponse:
    return post_service.like_post(
        db,
        post_id=post_id,
        current_user=current_user,
    )


@router.delete("/{post_id}/likes", response_model=PostResponse)
def unlike_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostResponse:
    return post_service.unlike_post(
        db,
        post_id=post_id,
        current_user=current_user,
    )
