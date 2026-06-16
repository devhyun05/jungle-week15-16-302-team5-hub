from typing import Any

from app.services.mcp_server import LocalMcpServer


class LocalMcpClient:
    def __init__(self, server: LocalMcpServer) -> None:
        self.server = server

    def call_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        request = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments,
            },
        }
        result = self.server.call_tool(
            name=request["params"]["name"],
            arguments=request["params"]["arguments"],
        )
        return {
            "jsonrpc": "2.0",
            "result": result,
        }
