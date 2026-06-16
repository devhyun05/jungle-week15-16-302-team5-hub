from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.dependencies.auth import require_roles
from app.schemas.mcp import McpJsonRpcRequest, McpJsonRpcResponse
from app.services import mcp_service


router = APIRouter(prefix="/mcp", tags=["mcp"])


@router.post("", response_model=McpJsonRpcResponse)
def handle_mcp_request(
    request: McpJsonRpcRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> McpJsonRpcResponse:
    try:
        result = mcp_service.handle_json_rpc(
            request_id=request.id,
            method=request.method,
            params=request.params,
            db=db,
            current_user=current_user,
        )
    except mcp_service.McpToolError as error:
        return McpJsonRpcResponse(
            id=request.id,
            error={
                "code": -32000,
                "message": str(error),
            },
        )

    return McpJsonRpcResponse(id=request.id, result=result)
