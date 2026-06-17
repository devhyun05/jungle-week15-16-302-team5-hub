import json

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.post import Post
from app.schemas.ai import (
    AgentStep,
    TradeHelperRecommendation,
    TradeHelperRecommendationResponse,
)
from app.services import rag_service

settings = get_settings()


def run_trade_helper_agent(
    db: Session,
    post: Post,
) -> TradeHelperRecommendationResponse:
    query_text = rag_service.build_post_source_text(post)
    sources = rag_service.search_similar_posts(db, query_text=query_text)
    steps = [
        AgentStep(step="rag_retrieval", detail=f"유사 판매글 {len(sources)}개를 검색했습니다."),
        AgentStep(step="goal_analysis", detail="상품 맥락에 맞는 거래 도움 추천을 준비했습니다."),
    ]

    if not settings.openai_api_key:
        steps.append(AgentStep(step="fallback", detail="OpenAI API key가 없어 기본 추천을 사용했습니다."))
        return build_response(post, sources, steps, build_fallback_recommendations(post), True)

    try:
        recommendations = call_openai_for_recommendations(post, sources)
        steps.append(AgentStep(step="openai_response", detail="OpenAI 모델로 추천 카드를 생성했습니다."))
        return build_response(post, sources, steps, recommendations, False)
    except (httpx.HTTPError, ValueError, KeyError, TypeError):
        steps.append(AgentStep(step="fallback", detail="OpenAI 호출 또는 응답 파싱에 실패해 기본 추천을 사용했습니다."))
        return build_response(post, sources, steps, build_fallback_recommendations(post), True)


def build_response(
    post: Post,
    sources,
    steps: list[AgentStep],
    recommendations: list[TradeHelperRecommendation],
    used_fallback: bool,
) -> TradeHelperRecommendationResponse:
    return TradeHelperRecommendationResponse(
        post_id=post.id,
        recommendations=recommendations[:3],
        sources=sources,
        agent_steps=steps,
        used_fallback=used_fallback,
    )


def call_openai_for_recommendations(
    post: Post,
    sources,
) -> list[TradeHelperRecommendation]:
    payload = {
        "model": settings.openai_model,
        "input": [
            {
                "role": "system",
                "content": (
                    "You are a marketplace trade helper agent. "
                    "Return only valid JSON. Recommend helpful companion items, "
                    "deal tips, or safety checks for a second-hand marketplace post."
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    {
                        "post": {
                            "title": post.title,
                            "description": post.description,
                            "category": post.category,
                            "price": post.price,
                            "trade_location": post.trade_location,
                        },
                        "similar_posts": [source.model_dump() for source in sources],
                        "output_shape": {
                            "recommendations": [
                                {
                                    "kind": "related_item | deal_tip | safety_tip",
                                    "title": "short Korean title",
                                    "description": "one sentence Korean recommendation",
                                    "reason": "why it fits this post",
                                }
                            ]
                        },
                    },
                    ensure_ascii=False,
                ),
            },
        ],
        "temperature": 0.3,
    }
    response = httpx.post(
        "https://api.openai.com/v1/responses",
        headers={
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=12,
    )
    response.raise_for_status()
    data = response.json()
    text = extract_openai_text(data)
    parsed = json.loads(text)

    return [
        TradeHelperRecommendation(
            kind=item["kind"],
            title=item["title"],
            description=item["description"],
            reason=item["reason"],
        )
        for item in parsed["recommendations"][:3]
    ]


def extract_openai_text(data: dict) -> str:
    if data.get("output_text"):
        return data["output_text"]

    for output in data.get("output", []):
        for content in output.get("content", []):
            if content.get("type") == "output_text" and content.get("text"):
                return content["text"]

    raise ValueError("OpenAI response text not found.")


def build_fallback_recommendations(post: Post) -> list[TradeHelperRecommendation]:
    related_title, related_description = related_item_for_category(post.category)
    return [
        TradeHelperRecommendation(
            kind="related_item",
            title=related_title,
            description=related_description,
            reason=f"{post.category} 상품을 거래할 때 함께 확인하면 좋은 항목입니다.",
        ),
        TradeHelperRecommendation(
            kind="deal_tip",
            title="상태 확인 질문 준비",
            description="거래 전에 사용 기간, 하자 여부, 구성품 포함 여부를 댓글로 확인해보세요.",
            reason="중고거래에서는 상품 상태와 구성품 확인이 거래 만족도에 직접 영향을 줍니다.",
        ),
        TradeHelperRecommendation(
            kind="safety_tip",
            title="직거래 장소 재확인",
            description=f"{post.trade_location} 근처의 사람이 많은 장소에서 거래하는 것을 추천합니다.",
            reason="공개된 장소에서 거래하면 안전하고 약속 위치를 서로 확인하기 쉽습니다.",
        ),
    ]


def related_item_for_category(category: str) -> tuple[str, str]:
    related_items = {
        "전자기기": ("충전기와 케이블 확인", "충전기, 케이블, 보호 케이스 포함 여부를 함께 확인해보세요."),
        "의류/잡화": ("실측 사이즈 확인", "표기 사이즈보다 어깨, 가슴, 총장 같은 실측 정보를 확인하는 것이 좋습니다."),
        "도서": ("필기와 훼손 여부 확인", "책 내부 필기, 찢김, 부록 포함 여부를 거래 전에 확인해보세요."),
        "가구/인테리어": ("운반 방법 확인", "크기와 무게를 확인하고 직접 운반이 가능한지 미리 조율해보세요."),
        "스포츠": ("마모 상태 확인", "사용 횟수, 마모 상태, 안전 장비 포함 여부를 확인해보세요."),
    }
    return related_items.get(
        category,
        ("구성품 확인", "거래 전에 기본 구성품과 사용 상태를 확인해보세요."),
    )
