"""Comments router practice target.

Session 10 will implement:
- `GET /posts/{post_id}/comments`
- `POST /posts/{post_id}/comments`
- `PATCH /comments/{comment_id}`
- `DELETE /comments/{comment_id}`
"""

from fastapi import APIRouter


router = APIRouter()
