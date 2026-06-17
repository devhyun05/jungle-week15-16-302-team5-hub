import json

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.post import Post
from app.schemas.ai import (
    AgentStep,
    RelatedAdRecommendation,
    RelatedAdRecommendationResponse,
)
from app.services import rag_service

settings = get_settings()

AD_CATALOG = [
    {
        "ad_id": "electronics-usbc-hub",
        "category": "전자기기",
        "keywords": ["맥북", "노트북", "아이패드", "충전", "케이블", "전자기기"],
        "title": "USB-C 멀티 허브",
        "description": "노트북이나 태블릿 거래 후 바로 쓰기 좋은 포트 확장 허브입니다.",
        "image_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=640&q=80",
        "display_price": "추천가 19,900원",
        "call_to_action": "관련 액세서리 보기",
    },
    {
        "ad_id": "electronics-protective-case",
        "category": "전자기기",
        "keywords": ["아이폰", "갤럭시", "아이패드", "케이스", "전자기기"],
        "title": "보호 케이스와 필름 세트",
        "description": "중고 기기 구매 후 흠집을 줄일 수 있는 기본 보호 세트입니다.",
        "image_url": "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=640&q=80",
        "display_price": "추천가 12,900원",
        "call_to_action": "보호용품 보기",
    },
    {
        "ad_id": "electronics-cleaning-kit",
        "category": "전자기기",
        "keywords": ["아이폰", "갤럭시", "노트북", "키보드", "전자기기"],
        "title": "전자기기 클리닝 키트",
        "description": "중고 전자기기를 깨끗하게 관리하기 좋은 화면/기기 청소 세트입니다.",
        "image_url": "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=640&q=80",
        "display_price": "추천가 8,900원",
        "call_to_action": "관리용품 보기",
    },
    {
        "ad_id": "fashion-lint-roller",
        "category": "의류/잡화",
        "keywords": ["코트", "니트", "셔츠", "의류", "잡화"],
        "title": "휴대용 보풀 제거기",
        "description": "중고 의류를 깔끔하게 관리하기 좋은 관리용품입니다.",
        "image_url": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=640&q=80",
        "display_price": "추천가 9,900원",
        "call_to_action": "의류 관리용품 보기",
    },
    {
        "ad_id": "book-clear-cover",
        "category": "도서",
        "keywords": ["책", "도서", "문제집", "교재"],
        "title": "투명 북커버",
        "description": "구매한 책을 오래 보관하기 위한 간단한 보호용품입니다.",
        "image_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=640&q=80",
        "display_price": "추천가 4,900원",
        "call_to_action": "도서용품 보기",
    },
    {
        "ad_id": "furniture-moving-strap",
        "category": "가구/인테리어",
        "keywords": ["가구", "책상", "의자", "수납", "인테리어"],
        "title": "가구 운반 스트랩",
        "description": "직거래 후 가구를 옮길 때 부담을 줄여주는 운반 보조용품입니다.",
        "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=640&q=80",
        "display_price": "추천가 15,900원",
        "call_to_action": "운반용품 보기",
    },
    {
        "ad_id": "sports-cleaning-kit",
        "category": "스포츠",
        "keywords": ["자전거", "운동", "스포츠", "헬멧", "라켓"],
        "title": "스포츠 장비 클리닝 키트",
        "description": "중고 스포츠 장비를 깨끗하게 관리하기 위한 기본 세트입니다.",
        "image_url": "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=640&q=80",
        "display_price": "추천가 11,900원",
        "call_to_action": "관리용품 보기",
    },
]


def run_related_ad_agent(
    db: Session,
    post: Post,
) -> RelatedAdRecommendationResponse:
    query_text = rag_service.build_post_source_text(post)
    sources = rag_service.search_similar_posts(db, query_text=query_text)
    steps = [
        AgentStep(step="rag_retrieval", detail=f"유사 판매글 {len(sources)}개를 검색했습니다."),
        AgentStep(step="ad_candidate_search", detail="상품 맥락과 맞는 광고 후보를 찾았습니다."),
    ]

    if not settings.openai_api_key:
        steps.append(AgentStep(step="fallback", detail="OpenAI API key가 없어 카테고리 기반 광고를 사용했습니다."))
        return build_response(post, sources, steps, select_fallback_ads(post), True)

    try:
        ads = call_openai_for_related_ads(post, sources)
        steps.append(AgentStep(step="openai_ad_selection", detail="OpenAI 모델이 광고 후보를 선택했습니다."))
        return build_response(post, sources, steps, ads, False)
    except (httpx.HTTPError, ValueError, KeyError, TypeError):
        steps.append(AgentStep(step="fallback", detail="OpenAI 호출 또는 응답 파싱에 실패해 카테고리 기반 광고를 사용했습니다."))
        return build_response(post, sources, steps, select_fallback_ads(post), True)


def build_response(
    post: Post,
    sources,
    steps: list[AgentStep],
    ads: list[RelatedAdRecommendation],
    used_fallback: bool,
) -> RelatedAdRecommendationResponse:
    return RelatedAdRecommendationResponse(
        post_id=post.id,
        ads=ads[:3],
        sources=sources,
        agent_steps=steps,
        used_fallback=used_fallback,
    )


def call_openai_for_related_ads(
    post: Post,
    sources,
) -> list[RelatedAdRecommendation]:
    payload = {
        "model": settings.openai_model,
        "input": [
            {
                "role": "system",
                "content": (
                    "You are an ad recommendation agent for a second-hand marketplace. "
                    "Choose up to 3 relevant ad_ids from the given catalog. "
                    "Return only JSON with an ad_ids array."
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
                        "ad_catalog": AD_CATALOG,
                        "output_shape": {"ad_ids": ["electronics-usbc-hub"]},
                    },
                    ensure_ascii=False,
                ),
            },
        ],
        "temperature": 0.2,
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
    parsed = json.loads(extract_openai_text(response.json()))
    selected_ids = parsed["ad_ids"][:3]
    ads = [build_ad_response(ad, post) for ad in AD_CATALOG if ad["ad_id"] in selected_ids]
    return ads or select_fallback_ads(post)


def extract_openai_text(data: dict) -> str:
    if data.get("output_text"):
        return data["output_text"]

    for output in data.get("output", []):
        for content in output.get("content", []):
            if content.get("type") == "output_text" and content.get("text"):
                return content["text"]

    raise ValueError("OpenAI response text not found.")


def select_fallback_ads(post: Post) -> list[RelatedAdRecommendation]:
    post_text = rag_service.build_post_source_text(post)
    scored_ads = []
    for ad in AD_CATALOG:
        score = 0
        if ad["category"] == post.category:
            score += 3
        score += sum(1 for keyword in ad["keywords"] if keyword in post_text)
        scored_ads.append((score, ad))

    scored_ads.sort(key=lambda item: item[0], reverse=True)
    return [build_ad_response(ad, post) for score, ad in scored_ads if score > 0][:3]


def build_ad_response(ad: dict, post: Post) -> RelatedAdRecommendation:
    return RelatedAdRecommendation(
        ad_id=ad["ad_id"],
        title=ad["title"],
        description=ad["description"],
        category=ad["category"],
        image_url=ad["image_url"],
        display_price=ad["display_price"],
        call_to_action=ad["call_to_action"],
        reason=f"{post.category} 상품인 '{post.title}'와 함께 보기 좋은 광고입니다.",
    )
