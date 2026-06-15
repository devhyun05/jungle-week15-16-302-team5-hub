from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


ReviewTargetType = Literal["post", "portfolio"]
ReviewStatusValue = Literal["대기 중", "검토 중", "피드백 완료", "수정 요청", "최종 확인"]


class FrontendResponseModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class CoachOptionResponse(FrontendResponseModel):
    id: int
    name: str
    email: str
    profile_image_url: str | None = Field(default=None, alias="profileImageUrl")


class CoachOptionListResponse(FrontendResponseModel):
    items: list[CoachOptionResponse]


class ReviewRequestCreateRequest(FrontendResponseModel):
    target_type: ReviewTargetType = Field(alias="targetType")
    target_id: int = Field(alias="targetId")
    coach_ids: list[int] = Field(alias="coachIds", min_length=1)
    message: str | None = Field(default=None, max_length=2000)


class ReviewRequestUpdateRequest(FrontendResponseModel):
    status: ReviewStatusValue | None = None
    feedback: str | None = Field(default=None, max_length=5000)


class ReviewRequestResponse(FrontendResponseModel):
    id: int
    requester_id: int = Field(alias="requesterId")
    requester_name: str = Field(alias="requesterName")
    requester_profile_image_url: str | None = Field(default=None, alias="requesterProfileImageUrl")
    coach_ids: list[int] = Field(alias="coachIds")
    coach_names: list[str] = Field(alias="coachNames")
    coach_profile_image_urls: list[str | None] = Field(alias="coachProfileImageUrls")
    target_type: str = Field(alias="targetType")
    target_id: int = Field(alias="targetId")
    target_title: str = Field(alias="targetTitle")
    target_summary: str | None = Field(default=None, alias="targetSummary")
    target_preview: str | None = Field(default=None, alias="targetPreview")
    target_link_url: str | None = Field(default=None, alias="targetLinkUrl")
    category: str
    category_slug: str = Field(alias="categorySlug")
    message: str | None
    status: str
    feedback: str | None
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class ReviewRequestListResponse(FrontendResponseModel):
    items: list[ReviewRequestResponse]
    total: int
