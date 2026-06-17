from typing import Literal

from pydantic import BaseModel, Field


PostWritingAction = Literal["refine", "fix_typos", "suggest_tags"]
McpCallStatus = Literal["sent", "skipped", "failed"]
TradeHelperRecommendationKind = Literal["related_item", "deal_tip", "safety_tip"]
RestrictedItemStatus = Literal["allowed", "warning", "blocked"]


class RagSource(BaseModel):
    post_id: int
    title: str
    category: str
    score: float


class AgentStep(BaseModel):
    step: str
    detail: str


class PolicySource(BaseModel):
    policy_id: str
    title: str
    category: str
    severity: RestrictedItemStatus
    score: float
    source_url: str


class PostWritingAssistRequest(BaseModel):
    action: PostWritingAction
    title: str = Field(default="", max_length=80)
    description: str | None = Field(default=None, max_length=1000)
    category: str | None = None
    price: int | None = Field(default=None, ge=0)
    trade_location: str | None = Field(default=None, max_length=40)


class PostWritingAssistResponse(BaseModel):
    action: PostWritingAction
    description: str
    suggested_tags: list[str]
    sources: list[RagSource]
    agent_steps: list[AgentStep]
    used_fallback: bool


class SlackTradeAlertRequest(BaseModel):
    message: str | None = Field(default=None, max_length=500)


class SlackTradeAlertResponse(BaseModel):
    status: McpCallStatus
    message: str
    tool_name: str
    request_payload: dict


class TradeHelperRecommendation(BaseModel):
    kind: TradeHelperRecommendationKind
    title: str
    description: str
    reason: str


class TradeHelperRecommendationResponse(BaseModel):
    post_id: int
    recommendations: list[TradeHelperRecommendation]
    sources: list[RagSource]
    agent_steps: list[AgentStep]
    used_fallback: bool


class RelatedAdRecommendation(BaseModel):
    ad_id: str
    title: str
    description: str
    category: str
    image_url: str
    display_price: str
    call_to_action: str
    reason: str


class RelatedAdRecommendationResponse(BaseModel):
    post_id: int
    ads: list[RelatedAdRecommendation]
    sources: list[RagSource]
    agent_steps: list[AgentStep]
    used_fallback: bool


class RestrictedItemCheckRequest(BaseModel):
    title: str = Field(default="", max_length=80)
    description: str | None = Field(default=None, max_length=1000)
    category: str | None = None


class RestrictedItemCheckResponse(BaseModel):
    status: RestrictedItemStatus
    message: str
    matched_policy_titles: list[str]
    sources: list[PolicySource]
    agent_steps: list[AgentStep]
    tool_name: str
    request_payload: dict
