"""댓글 라우터 연습 대상.

세션 10에서 구현할 것:
- `GET /posts/{post_id}/comments`
- `POST /posts/{post_id}/comments`
- `PATCH /comments/{comment_id}`
- `DELETE /comments/{comment_id}`
"""

from fastapi import APIRouter


router = APIRouter()
