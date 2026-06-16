from pydantic import BaseModel, Field

from app.schemas.ai import AIOutputType


class AgentRunRequest(BaseModel):
    project_id: int = Field(..., ge=1)
    output_type: AIOutputType
    user_goal: str = Field(default="", max_length=1000)
    max_iterations: int = Field(default=3, ge=1, le=5)


class AgentToolCall(BaseModel):
    step: int
    tool_name: str
    status: str
    summary: str


class AgentRunResponse(BaseModel):
    project_id: int
    output_type: AIOutputType
    final_content: str
    tool_calls: list[AgentToolCall]
    stopped_reason: str
