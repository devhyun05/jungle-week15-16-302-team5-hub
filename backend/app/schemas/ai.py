from typing import Literal

from pydantic import BaseModel, Field


AIOutputType = Literal["portfolio", "interview"]
AIGenerationMode = Literal["direct", "rag", "agent"]


class AIGenerateRequest(BaseModel):
    project_id: int = Field(..., ge=1)
    output_type: AIOutputType
    generation_mode: AIGenerationMode = "direct"


class AIReferenceSummary(BaseModel):
    linked_record_count: int
    github_commit_count: int
    readme_included: bool
    rag_context_count: int = 0
    generation_mode: AIGenerationMode = "direct"


class AIGenerateResponse(BaseModel):
    project_id: int
    project_title: str
    output_type: AIOutputType
    model: str
    content: str
    references: AIReferenceSummary
