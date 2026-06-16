import httpx

from app.core.config import get_settings
from app.models.post import Post
from app.schemas.ai import SlackTradeAlertResponse
from app.services.mcp_client import LocalMcpClient
from app.services.mcp_server import LocalMcpServer, McpTool

settings = get_settings()
SLACK_TRADE_ALERT_TOOL = "slack.send_trade_alert"


def send_slack_trade_alert(post: Post, message: str | None = None) -> SlackTradeAlertResponse:
    server = LocalMcpServer()
    server.register_tool(
        McpTool(
            name=SLACK_TRADE_ALERT_TOOL,
            description="Send a Jungle Market trade alert to Slack.",
            input_schema={
                "type": "object",
                "properties": {
                    "post_id": {"type": "integer"},
                    "title": {"type": "string"},
                    "price": {"type": "integer"},
                    "trade_location": {"type": "string"},
                    "message": {"type": "string"},
                },
                "required": ["post_id", "title", "price", "trade_location"],
            },
            handler=post_trade_alert_to_slack,
        )
    )
    client = LocalMcpClient(server)
    payload = {
        "post_id": post.id,
        "title": post.title,
        "price": post.price,
        "trade_location": post.trade_location,
        "message": message or "",
    }
    response = client.call_tool(SLACK_TRADE_ALERT_TOOL, payload)
    result = response["result"]

    return SlackTradeAlertResponse(
        status=result["status"],
        message=result["message"],
        tool_name=SLACK_TRADE_ALERT_TOOL,
        request_payload=payload,
    )


def post_trade_alert_to_slack(arguments: dict) -> dict:
    slack_message = build_slack_message(arguments)
    if not settings.slack_bot_token or not settings.slack_trade_alert_channel_id:
        return {
            "status": "skipped",
            "message": "Slack bot token 또는 channel id가 없어 전송 대신 preview만 생성했습니다.",
            "preview": slack_message,
        }

    try:
        response = httpx.post(
            "https://slack.com/api/chat.postMessage",
            headers={
                "Authorization": f"Bearer {settings.slack_bot_token}",
                "Content-Type": "application/json; charset=utf-8",
            },
            json={
                "channel": settings.slack_trade_alert_channel_id,
                "text": slack_message,
            },
            timeout=5,
        )
        response.raise_for_status()
        data = response.json()
    except (httpx.HTTPError, ValueError):
        return {"status": "failed", "message": "Slack API 호출에 실패했습니다."}

    if not data.get("ok"):
        return {
            "status": "failed",
            "message": data.get("error", "Slack 메시지를 전송하지 못했습니다."),
        }

    return {"status": "sent", "message": "Slack 거래 알림을 전송했습니다."}


def build_slack_message(arguments: dict) -> str:
    custom_message = arguments.get("message")
    lines = [
        "[Jungle Market] 거래 알림",
        f"- 상품: {arguments['title']}",
        f"- 가격: {arguments['price']:,}원",
        f"- 장소: {arguments['trade_location']}",
    ]
    if custom_message:
        lines.append(f"- 메모: {custom_message}")

    return "\n".join(lines)
