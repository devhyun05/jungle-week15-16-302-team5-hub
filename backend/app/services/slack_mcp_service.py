import httpx

from app.core.config import get_settings
from app.models.post import Post
from app.models.user import User
from app.schemas.ai import SlackTradeAlertResponse
from app.services.mcp_client import LocalMcpClient
from app.services.mcp_server import LocalMcpServer, McpTool

settings = get_settings()
SLACK_TRADE_ALERT_TOOL = "slack.send_trade_alert"


def build_slack_error_message(action: str, data: dict) -> str:
    error = data.get("error", "unknown_error")
    needed = data.get("needed")
    provided = data.get("provided")

    message = f"{action} 실패: {error}"
    if needed:
        message += f" / 필요한 scope: {needed}"
    if provided:
        message += f" / 현재 token scope: {provided}"

    return message


def send_slack_trade_alert(
    *,
    post: Post,
    sender: User,
    seller: User,
    message: str | None = None,
) -> SlackTradeAlertResponse:
    server = LocalMcpServer()
    server.register_tool(
        McpTool(
            name=SLACK_TRADE_ALERT_TOOL,
            description="Send a Jungle Market trade alert to the seller by Slack DM.",
            input_schema={
                "type": "object",
                "properties": {
                    "post_id": {"type": "integer"},
                    "title": {"type": "string"},
                    "price": {"type": "integer"},
                    "trade_location": {"type": "string"},
                    "seller_slack_user_id": {"type": "string"},
                    "sender_name": {"type": "string"},
                    "sender_email": {"type": "string"},
                    "sender_profile_image_url": {"type": "string"},
                    "message": {"type": "string"},
                },
                "required": [
                    "post_id",
                    "title",
                    "price",
                    "trade_location",
                    "seller_slack_user_id",
                    "sender_name",
                ],
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
        "seller_slack_user_id": seller.slack_user_id,
        "sender_name": sender.username,
        "sender_email": sender.email,
        "sender_profile_image_url": sender.profile_image_url or "",
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
    if not settings.slack_bot_token or not arguments.get("seller_slack_user_id"):
        return {
            "status": "skipped",
            "message": "Slack bot token 또는 판매자 Slack ID가 없어 전송 대신 preview만 생성했습니다.",
            "preview": slack_message,
        }

    try:
        open_response = httpx.post(
            "https://slack.com/api/conversations.open",
            headers={
                "Authorization": f"Bearer {settings.slack_bot_token}",
                "Content-Type": "application/json; charset=utf-8",
            },
            json={
                "users": arguments["seller_slack_user_id"],
            },
            timeout=5,
        )
        open_response.raise_for_status()
        open_data = open_response.json()
        if not open_data.get("ok"):
            return {
                "status": "failed",
                "message": build_slack_error_message("Slack DM 채널 열기", open_data),
            }

        channel_id = open_data["channel"]["id"]
        message_payload = {
            "channel": channel_id,
            "text": slack_message,
            "username": arguments["sender_name"],
        }
        if arguments.get("sender_profile_image_url"):
            message_payload["icon_url"] = arguments["sender_profile_image_url"]
        else:
            message_payload["icon_emoji"] = ":speech_balloon:"

        response = httpx.post(
            "https://slack.com/api/chat.postMessage",
            headers={
                "Authorization": f"Bearer {settings.slack_bot_token}",
                "Content-Type": "application/json; charset=utf-8",
            },
            json=message_payload,
            timeout=5,
        )
        response.raise_for_status()
        data = response.json()
    except (httpx.HTTPError, ValueError):
        return {"status": "failed", "message": "Slack API 호출에 실패했습니다."}

    if not data.get("ok"):
        return {
            "status": "failed",
            "message": build_slack_error_message("Slack 메시지 전송", data),
        }

    return {"status": "sent", "message": "판매자에게 Slack 거래 문의를 전송했습니다."}


def build_slack_message(arguments: dict) -> str:
    custom_message = arguments.get("message")
    post_url = f"{settings.frontend_url.rstrip('/')}/post-details/{arguments['post_id']}"
    lines = [
        "[Jungle Market] 새 거래 문의가 도착했습니다.",
        f"- 상품: {arguments['title']}",
        f"- 가격: {arguments['price']:,}원",
        f"- 장소: {arguments['trade_location']}",
        f"- 문의자: {arguments['sender_name']}",
    ]
    if arguments.get("sender_email"):
        lines.append(f"- 문의자 이메일: {arguments['sender_email']}")

    if custom_message:
        lines.append(f"- 메모: {custom_message}")

    lines.extend(
        [
            "",
            "상품 페이지에서 댓글을 확인하고 답변해주세요.",
            f"상품 보기: {post_url}",
        ]
    )

    return "\n".join(lines)
