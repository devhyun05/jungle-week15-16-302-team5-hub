from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.post import Post
from app.models.user import User
from app.schemas.post import PostCreateRequest, PostResponse, PostUpdateRequest


def create_post(
    db: Session,
    post_request: PostCreateRequest,
    current_user: User,
) -> Post:
    post = Post(
        title=post_request.title,
        body=post_request.body,
        author_id=current_user.id,
    )
    
    db.add(post)
    db.commit()
    db.refresh(post)

    return post


def list_posts(db: Session) -> list[Post]:
    return (
        db.query(Post)
        .order_by(Post.created_at.desc())
        .all()
    )


def get_post(db: Session,
             post_id: int) -> Post:
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
