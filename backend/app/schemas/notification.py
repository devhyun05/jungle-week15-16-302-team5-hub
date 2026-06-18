from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FrontendResponseModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class NotificationItemResponse(FrontendResponseModel):
    id: int
    type: str
    message: str
    link_url: str | None = Field(default=None, alias="linkUrl")
    is_read: bool = Field(alias="isRead")
    created_at: datetime = Field(alias="createdAt")


class NotificationListResponse(FrontendResponseModel):
    items: list[NotificationItemResponse]
    total: int
    unread_count: int = Field(alias="unreadCount")
