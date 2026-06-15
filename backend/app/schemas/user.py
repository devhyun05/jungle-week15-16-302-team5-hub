from pydantic import BaseModel

from app.schemas.auth import UserResponse
from app.schemas.comment import CommentResponse
from app.schemas.post import PostResponse


class MyActivityResponse(BaseModel):
    user: UserResponse
    posts: list[PostResponse]
    comments: list[CommentResponse]
