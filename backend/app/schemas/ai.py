from typing import Literal

from pydantic import BaseModel, Field


PostWritingAction = Literal["refine", "fix_typos", "suggest_tags"]
McpCallStatus = Literal["sent", "skipped", "failed"]


class RagSource(BaseModel):
    post_id: int
    title: str
    category: str
    score: float


class AgentStep(BaseModel):
    step: str
    detail: str


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
