from typing import Literal

from pydantic import BaseModel, Field


AIOutputType = Literal["portfolio", "interview"]


class AIGenerateRequest(BaseModel):
    project_id: int = Field(..., ge=1)
    output_type: AIOutputType


class AIReferenceSummary(BaseModel):
    linked_record_count: int
    github_commit_count: int
    readme_included: bool


class AIGenerateResponse(BaseModel):
    project_id: int
    project_title: str
    output_type: AIOutputType
    model: str
    content: str
    references: AIReferenceSummary

