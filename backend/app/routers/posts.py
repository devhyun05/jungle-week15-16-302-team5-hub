from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_posts():
    """TODO: 게시글 목록, 검색, 필터, 페이징을 구현한다."""
    return {"items": [], "page": 1, "size": 10, "total": 0}


@router.post("")
def create_post():
    """TODO: recipe/failure/review 유형별 게시글 작성을 구현한다."""
    return {"message": "create post endpoint skeleton"}


@router.get("/{post_id}")
def get_post(post_id: int):
    """TODO: 게시글 상세, 태그, 댓글 수, AI 진단 결과를 조회한다."""
    return {"post_id": post_id}


@router.patch("/{post_id}")
def update_post(post_id: int):
    """TODO: 작성자 권한 확인 후 게시글을 수정한다."""
    return {"post_id": post_id}


@router.delete("/{post_id}")
def delete_post(post_id: int):
    """TODO: 작성자 권한 확인 후 게시글을 삭제한다."""
    return {"post_id": post_id}
