from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db


class HealthResponse(BaseModel):
    status: str
    service: str


class DatabaseHealthResponse(BaseModel):
    status: str
    database: str


router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
def get_health_status() -> HealthResponse:
    """Return the backend application health status."""

    return HealthResponse(
        status="ok",
        service="junglelog-backend",
    )


@router.get("/db", response_model=DatabaseHealthResponse)
def get_database_health(db: Session = Depends(get_db)) -> DatabaseHealthResponse:
    """Verify that FastAPI can execute a simple PostgreSQL query."""

    db.execute(text("SELECT 1"))

    return DatabaseHealthResponse(
        status="ok",
        database="postgresql",
    )
