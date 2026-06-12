from fastapi import FastAPI
from pydantic import BaseModel

from app.tools.product_search import search_products

app = FastAPI(title="Malang Lab MCP Server")


class JsonRpcRequest(BaseModel):
    jsonrpc: str = "2.0"
    method: str
    params: dict = {}
    id: int | str | None = None


@app.get("/health")
def health_check() -> dict[str, str]:
    """MCP Server health check."""
    return {"status": "ok"}


@app.post("/jsonrpc")
def jsonrpc_endpoint(payload: JsonRpcRequest):
    if payload.method != "search_products":
        return {
            "jsonrpc": "2.0",
            "error": {"code": -32601, "message": "Method not found"},
            "id": payload.id,
        }

    query = str(payload.params.get("query", "")).strip()
    if not query:
        return {
            "jsonrpc": "2.0",
            "error": {"code": -32602, "message": "query is required"},
            "id": payload.id,
        }

    return {
        "jsonrpc": "2.0",
        "result": search_products(query),
        "id": payload.id,
    }
