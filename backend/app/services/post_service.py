"""게시글 서비스 연습 대상.

세션 07, 08, 09에서 응답 변환, 검색/페이징, 게시글 쓰기 도우미를 구현한다.
"""

from app.models import Post
from app.schemas.post import PostAuthorResponse, PostResponse


SUMMARY_MAX_LENGTH = 80


# 게시글 목록 카드에 보여줄 짧은 요약문을 만든다.
# 본문이 길면 앞부분만 남기고 말줄임표를 붙인다.
def make_post_summary(content: str, max_length: int = SUMMARY_MAX_LENGTH) -> str:
    summary = content.strip()

    if len(summary) <= max_length:
        return summary

    return f"{summary[:max_length].rstrip()}..."


# SQLAlchemy Post 객체를 프론트가 바로 쓰는 응답 스키마로 바꾼다.
# 태그 이름, 댓글 수, 작성자 여부처럼 DB 컬럼 그대로가 아닌 값을 함께 계산한다.
def post_to_response(
    post: Post,
    current_user_id: int | None = None,
) -> PostResponse:
    return PostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        summary=make_post_summary(post.content),
        post_type=post.post_type,
        slime_type=post.slime_type,
        tags=[tag.name for tag in post.tags],
        author=PostAuthorResponse.model_validate(post.author),
        comment_count=len(post.comments),
        is_owner=current_user_id is not None and post.author_id == current_user_id,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )
