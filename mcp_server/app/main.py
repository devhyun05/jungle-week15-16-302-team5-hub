from fastapi import FastAPI

app = FastAPI(title="Malang Lab MCP Server")


@app.get("/health")
def health_check() -> dict[str, str]:
    """MCP Server health check."""
    return {"status": "ok"}


@app.post("/jsonrpc")
def jsonrpc_endpoint():
    """TODO: JSON-RPC 요청을 받아 weather tool을 실행한다."""
    return {
        "jsonrpc": "2.0",
        "result": {"message": "jsonrpc endpoint skeleton"},
        "id": 1,
    }
