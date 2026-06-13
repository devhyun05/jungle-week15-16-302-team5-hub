from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.post import Post
from app.models.user import User
from app.models.tag import Tag
from app.schemas.post import PostCreateRequest, PostPageResponse, PostUpdateRequest
from app.services.tag_service import resolve_tags, normalize_tag_name

def create_post(
    db: Session,
    post_request: PostCreateRequest,
    current_user: User,
) -> Post:
    tags = resolve_tags(db, post_request.tag_names)

    post = Post(
        title=post_request.title,
        body=post_request.body,
        author_id=current_user.id,
        tags=tags,
    )
    
    db.add(post)
    db.commit()
    db.refresh(post)

    return post


def list_posts(
    db: Session,
    q: str | None = None,
    tag: str | None = None,
    page: int = 1,
    size: int = 10,
) -> PostPageResponse:
    query = db.query(Post)

    search_text = q.strip() if q else None

    if search_text:
        keyword = f"%{search_text}%"
        query = query.filter(
            or_(
                Post.title.ilike(keyword),
                Post.body.ilike(keyword),
            )
        )

    tag_name = normalize_tag_name(tag) if tag else None

    if tag_name:
        query = (
            query
            .join(Post.tags)
            .filter(Tag.normalized_name == tag_name)
        )

    total = query.count()
    offset = (page - 1) * size

    items = (
        query
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(size)
        .all()
    )

    return PostPageResponse(
        items=items,
        page=page,
        size=size,
        total=total,
        has_next=offset + len(items) < total,
        has_prev=page > 1,
    )


def get_post(
        db: Session,
        post_id: int,
) -> Post:
    post = (
        db.query(Post)
        .filter(Post.id == post_id)
        .first()
    )

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    return post


def update_post(db: Session,
                post_id: int,
                update_request: PostUpdateRequest,
                current_user: User,
) -> Post:
    post = get_post(db, post_id)

    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to update this post",
        )
    
    if update_request.title is not None:
        if not update_request.title.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title cannot be empty or whitespace",
            )
        post.title = update_request.title

    if update_request.body is not None:
        if not update_request.body.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Body cannot be empty or whitespace",
            )
        post.body = update_request.body

    if update_request.tag_names is not None:
        post.tags = resolve_tags(db, update_request.tag_names)

    db.commit()
    db.refresh(post)

    return post


def delete_post(db: Session,
                post_id: int,
                current_user: User,
) -> None:
    post = get_post(db, post_id)

    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to delete this post",
        )
    
    db.delete(post)
    db.commit()
