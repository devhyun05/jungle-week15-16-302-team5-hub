from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


UserRoleValue = Literal["STUDENT", "COACH", "ADMIN"]
ApprovalStatusValue = Literal["승인 대기", "승인 완료", "거절", "정지"]


class FrontendResponseModel(BaseModel):
    # Backend code uses snake_case, but React receives camelCase JSON.
    model_config = ConfigDict(populate_by_name=True)


class AdminUserItemResponse(FrontendResponseModel):
    id: int
    email: str
    name: str
    profile_image_url: str | None = Field(default=None, alias="profileImageUrl")
    role: str
    approval_status: str = Field(alias="approvalStatus")
    approval_note: str | None = Field(default=None, alias="approvalNote")
    requested_at: datetime = Field(alias="requestedAt")
    approved_at: datetime | None = Field(default=None, alias="approvedAt")
    approved_by: str | None = Field(default=None, alias="approvedBy")
    last_login_at: datetime | None = Field(default=None, alias="lastLoginAt")


class AdminUserListResponse(FrontendResponseModel):
    items: list[AdminUserItemResponse]
    total: int
    page: int
    size: int


class AdminUserUpdateRequest(FrontendResponseModel):
    # All fields are optional so the UI can change only role, only status, or both.
    role: UserRoleValue | None = None
    approval_status: ApprovalStatusValue | None = Field(default=None, alias="approvalStatus")
    approval_note: str | None = Field(default=None, alias="approvalNote", max_length=1000)
