from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FrontendResponseModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class PortfolioProjectCreateRequest(FrontendResponseModel):
    github_url: str = Field(alias="githubUrl", min_length=1, max_length=500)
    title: str | None = Field(default=None, max_length=200)
    summary: str | None = None
    tech_stack: list[str] = Field(default_factory=list, alias="techStack", max_length=20)


class PortfolioProjectUpdateRequest(FrontendResponseModel):
    title: str | None = Field(default=None, max_length=200)
    summary: str | None = None
    tech_stack: list[str] | None = Field(default=None, alias="techStack", max_length=20)
    portfolio_status: str | None = Field(default=None, alias="portfolioStatus", max_length=30)
    saved_portfolio_draft: str | None = Field(default=None, alias="savedPortfolioDraft")


class PortfolioProjectPostLinkRequest(FrontendResponseModel):
    post_ids: list[int] = Field(default_factory=list, alias="postIds")


class PortfolioProjectResponse(FrontendResponseModel):
    id: int
    title: str
    repo_full_name: str = Field(alias="repoFullName")
    github_url: str = Field(alias="githubUrl")
    summary: str | None
    tech_stack: list[str] = Field(alias="techStack")
    readme_summary: str | None = Field(alias="readmeSummary")
    recent_commit_summary: list[str] = Field(alias="recentCommitSummary")
    saved_portfolio_draft: str | None = Field(alias="savedPortfolioDraft")
    portfolio_status: str = Field(alias="portfolioStatus")
    coach_feedback_status: str = Field(alias="coachFeedbackStatus")
    github_connected: bool = Field(alias="githubConnected")
    ai_draft_saved: bool = Field(alias="aiDraftSaved")
    last_commit_at: datetime | None = Field(alias="lastCommitAt")
    linked_post_ids: list[int] = Field(alias="linkedPostIds")
    linked_record_count: int = Field(alias="linkedRecordCount")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class PortfolioProjectListResponse(FrontendResponseModel):
    items: list[PortfolioProjectResponse]
    total: int
