import re

from sqlalchemy.orm import Session

from app.schemas.ai import (
    AgentStep,
    PostWritingAssistRequest,
    PostWritingAssistResponse,
)
from app.services import rag_service


def run_post_writing_agent(
    db: Session,
    request: PostWritingAssistRequest,
) -> PostWritingAssistResponse:
    query_text = " ".join(
        value
        for value in [
            request.title,
            request.description or "",
            request.category or "",
            request.trade_location or "",
        ]
        if value
    )
    sources = rag_service.search_similar_posts(db, query_text=query_text)
    steps = [
        AgentStep(step="rag_retrieval", detail=f"유사 판매글 {len(sources)}개를 검색했습니다."),
        AgentStep(step="tool_selection", detail=f"{request.action} 작성 도구를 선택했습니다."),
    ]

    description = request.description or ""
    if request.action == "refine":
        description = refine_description(request, sources)
    elif request.action == "fix_typos":
        description = fix_typos(description)

    tags = suggest_tags(request, sources)
    steps.append(AgentStep(step="final_output", detail="작성 결과를 구조화해서 반환했습니다."))

    return PostWritingAssistResponse(
        action=request.action,
        description=description,
        suggested_tags=tags,
        sources=sources,
        agent_steps=steps,
        used_fallback=True,
    )


def refine_description(
    request: PostWritingAssistRequest,
    sources,
) -> str:
    sentences = []
    base_description = (request.description or "").strip()

    if base_description:
        sentences.append(fix_typos(base_description))
    elif request.title:
        sentences.append(f"{request.title} 판매합니다.")

    if request.price is not None:
        sentences.append(f"가격은 {request.price:,}원입니다.")

    if request.trade_location:
        sentences.append(f"거래는 {request.trade_location}에서 가능합니다.")

    if request.category:
        sentences.append(f"{request.category} 카테고리 상품입니다.")

    if sources:
        categories = sorted({source.category for source in sources})
        sentences.append(f"비슷한 판매글 기준으로 {', '.join(categories[:2])} 상품과 함께 비교해볼 수 있습니다.")

    return "\n".join(sentences)


def fix_typos(description: str) -> str:
    text = description.strip()
    text = re.sub(r"\s+", " ", text)
    text = text.replace("됬", "됐")
    text = text.replace("되요", "돼요")
    text = text.replace("안되", "안 돼")
    text = text.replace("가능 하", "가능하")
    return text


def suggest_tags(
    request: PostWritingAssistRequest,
    sources,
) -> list[str]:
    tags: list[str] = []

    for value in [request.category, request.trade_location]:
        if value:
            tags.append(value)

    title_words = re.findall(r"[0-9a-zA-Z가-힣]+", request.title)
    tags.extend(word for word in title_words if 2 <= len(word) <= 12)
    tags.extend(source.category for source in sources)

    unique_tags = []
    for tag in tags:
        if tag not in unique_tags:
            unique_tags.append(tag)

    return unique_tags[:6]
