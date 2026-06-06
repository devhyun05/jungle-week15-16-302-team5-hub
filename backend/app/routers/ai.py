from fastapi import APIRouter

router = APIRouter()


@router.post("/diagnose")
def diagnose():
    """TODO: 말랑 진단 에이전트를 실행한다.

    내부 흐름:
    1. 게시글 조회
    2. RAG 유사 사례 검색
    3. MCP 습도 조회
    4. LLM으로 원인/해결 순서 생성
    5. ai_diagnoses 저장
    """
    return {"message": "diagnose endpoint skeleton"}


@router.get("/similar-posts/{post_id}")
def similar_posts(post_id: int):
    """TODO: pgvector 기반 유사 실패 사례를 반환한다."""
    return {"post_id": post_id, "items": []}


@router.post("/tags/suggest")
def suggest_tags():
    """TODO: 사용자 글 기반 자동 태그 추천을 구현한다."""
    return {"tags": []}
