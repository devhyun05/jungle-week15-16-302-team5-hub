from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import get_user_by_id
from app.schemas.ai import (
    PostWritingAssistRequest,
    PostWritingAssistResponse,
    RelatedAdRecommendationResponse,
    RestrictedItemCheckRequest,
    RestrictedItemCheckResponse,
    SlackTradeAlertRequest,
    SlackTradeAlertResponse,
    TradeHelperRecommendationResponse,
)
from app.schemas.comment import CommentCreate
from app.services import (
    ai_agent_service,
    comment_service,
    post_service,
    related_ad_agent_service,
    restricted_item_agent_service,
    slack_mcp_service,
    trade_helper_agent_service,
)
from app.services.embedding_service import EmbeddingServiceError

router = APIRouter(prefix="/ai", tags=["ai"])
settings = get_settings()


def is_local_ai_generation_blocked() -> bool:
    return settings.frontend_url.startswith(("http://localhost", "http://127.0.0.1"))


@router.post("/post-writing-assist", response_model=PostWritingAssistResponse)
def assist_post_writing(
    request: PostWritingAssistRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostWritingAssistResponse:
    if is_local_ai_generation_blocked():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="로컬에서는 AI 작성 도구를 잠시 비활성화했습니다.",
        )

    try:
        return ai_agent_service.run_post_writing_agent(db, request)
    except EmbeddingServiceError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI embedding을 생성하지 못했습니다.",
        )


@router.post("/restricted-item-check", response_model=RestrictedItemCheckResponse)
def check_restricted_item(
    request: RestrictedItemCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RestrictedItemCheckResponse:
    try:
        return restricted_item_agent_service.run_restricted_item_agent(db, request)
    except EmbeddingServiceError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI 거래 안전 검사를 실행하지 못했습니다.",
        )


@router.get(
    "/posts/{post_id}/trade-helper-recommendations",
    response_model=TradeHelperRecommendationResponse,
)
def recommend_trade_helpers(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TradeHelperRecommendationResponse:
    post = post_service.find_post_or_404(db, post_id=post_id)
    try:
        return trade_helper_agent_service.run_trade_helper_agent(db, post)
    except EmbeddingServiceError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI 추천을 생성하지 못했습니다.",
        )


@router.get(
    "/posts/{post_id}/related-ads",
    response_model=RelatedAdRecommendationResponse,
)
def recommend_related_ads(
    post_id: int,
    db: Session = Depends(get_db),
) -> RelatedAdRecommendationResponse:
    post = post_service.find_post_or_404(db, post_id=post_id)
    try:
        return related_ad_agent_service.run_related_ad_agent(db, post)
    except EmbeddingServiceError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI 광고 추천을 생성하지 못했습니다.",
        )


@router.post("/posts/{post_id}/slack-alert", response_model=SlackTradeAlertResponse)
def send_post_slack_alert(
    post_id: int,
    request: SlackTradeAlertRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SlackTradeAlertResponse:
    post = post_service.find_post_or_404(db, post_id=post_id)
    if post.seller_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot send a trade alert to yourself.",
        )

    seller = get_user_by_id(db, user_id=post.seller_id)
    if seller is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found.",
        )
    if not seller.slack_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This seller has not connected Slack alerts.",
        )
    if settings.allowed_slack_team_id and seller.slack_team_id != settings.allowed_slack_team_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This seller is not in the allowed Slack workspace.",
        )

    comment_message = request.message or "Slack으로 거래 문의를 보냈습니다. 상품 확인 부탁드립니다."
    comment_service.create_comment(
        db,
        post_id=post_id,
        comment_data=CommentCreate(content=comment_message, is_secret=True),
        writer=current_user,
    )

    return slack_mcp_service.send_slack_trade_alert(
        post=post,
        sender=current_user,
        seller=seller,
        message=comment_message,
    )
