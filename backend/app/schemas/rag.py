from pydantic import BaseModel, Field


class RagIndexRequest(BaseModel):
    project_id: int = Field(..., ge=1)


class RagIndexResponse(BaseModel):
    project_id: int
    indexed_count: int
    embedding_model: str


class RagSearchRequest(BaseModel):
    project_id: int = Field(..., ge=1)
    query: str = Field(..., min_length=1, max_length=1000)
    top_k: int = Field(default=5, ge=1, le=10)


class RagSearchItem(BaseModel):
    document_id: int
    source_type: str
    source_id: str
    title: str
    content: str
    score: float


class RagSearchResponse(BaseModel):
    project_id: int
    query: str
    items: list[RagSearchItem]
