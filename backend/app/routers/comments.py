from fastapi import APIRouter

router = APIRouter()


@router.get("/posts/{post_id}/comments")
def list_comments(post_id: int):
    """TODO: 특정 게시글의 댓글 목록을 조회한다."""
    return {"post_id": post_id, "items": []}


@router.post("/posts/{post_id}/comments")
def create_comment(post_id: int):
    """TODO: 로그인 사용자 댓글 작성을 구현한다."""
    return {"post_id": post_id}


@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: int):
    """TODO: 댓글 작성자 권한 확인 후 삭제한다."""
    return {"comment_id": comment_id}
