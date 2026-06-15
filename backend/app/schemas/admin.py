from datetime import datetime

from pydantic import BaseModel, Field


class ModerationRequest(BaseModel):
    reason: str | None = Field(default=None, max_length=255)


class AdminModerationResponse(BaseModel):
    target_type: str
    target_id: int
    hidden_at: datetime | None
    hidden_by_id: int | None
    hidden_reason: str | None
