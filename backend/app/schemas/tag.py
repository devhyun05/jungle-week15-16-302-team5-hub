from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TagResponse(BaseModel):
    id: int
    normalized_name: str
    display_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)