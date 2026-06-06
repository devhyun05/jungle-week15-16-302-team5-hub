from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_tags():
    """TODO: 슬라임 종류, 실패 증상, 질감, 난이도 태그를 조회한다."""
    return {"items": []}


@router.get("/popular")
def popular_tags():
    """TODO: 게시글에 많이 쓰인 태그 순위를 반환한다."""
    return {"items": []}
