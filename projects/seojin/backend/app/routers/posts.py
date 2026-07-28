"""게시글 라우터 연습 대상.

세션 08, 09에서 구현할 것:
- `GET /posts`
- `POST /posts`
- `GET /posts/{post_id}`
- `PATCH /posts/{post_id}`
- `DELETE /posts/{post_id}`
"""

from fastapi import APIRouter


router = APIRouter()
