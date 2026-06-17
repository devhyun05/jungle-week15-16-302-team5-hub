from sqlalchemy.orm import Session

from app.repositories import ai_repository
from app.schemas.ai import (
    AgentStep,
    PolicySource,
    RestrictedItemCheckRequest,
    RestrictedItemCheckResponse,
)
from app.services.embedding_service import (
    content_hash,
    cosine_similarity,
    create_embedding,
    has_current_embedding,
    normalize_text,
)
from app.services.mcp_client import LocalMcpClient
from app.services.mcp_server import LocalMcpServer, McpTool
from app.services.restricted_policy_data import RESTRICTED_TRADE_POLICIES

RESTRICTED_ITEM_POLICY_TOOL = "policy.check_restricted_item"


def build_policy_source_text(policy: dict) -> str:
    return " ".join(
        [
            policy["title"],
            policy["category"],
            policy["severity"],
            " ".join(policy["keywords"]),
            policy["source_text"],
        ]
    )


def build_post_check_text(request: RestrictedItemCheckRequest) -> str:
    return " ".join(
        value
        for value in [
            request.title,
            request.description or "",
            request.category or "",
        ]
        if value
    )


def index_restricted_trade_policies(db: Session) -> None:
    for policy in RESTRICTED_TRADE_POLICIES:
        source_text = build_policy_source_text(policy)
        source_hash = content_hash(source_text)
        embedding = ai_repository.get_restricted_policy_embedding(
            db,
            policy_id=policy["policy_id"],
        )

        if embedding is not None and has_current_embedding(
            stored_hash=embedding.content_hash,
            stored_vector=embedding.vector,
            current_hash=source_hash,
            expected_dimension=None,
        ):
            continue

        ai_repository.save_restricted_policy_embedding(
            db,
            policy=policy,
            content_hash=source_hash,
            vector=create_embedding(source_text),
        )


def search_restricted_trade_policies(
    db: Session,
    query_text: str,
    limit: int = 5,
) -> list[PolicySource]:
    if not normalize_text(query_text):
        return []

    index_restricted_trade_policies(db)
    query_vector = create_embedding(query_text)
    sources: list[PolicySource] = []

    for embedding in ai_repository.list_restricted_policy_embeddings(db):
        score = cosine_similarity(query_vector, embedding.vector)
        if score <= 0:
            continue

        sources.append(
            PolicySource(
                policy_id=embedding.policy_id,
                title=embedding.title,
                category=embedding.category,
                severity=embedding.severity,
                score=round(score, 3),
                source_url=embedding.source_url,
            )
        )

    return sorted(sources, key=lambda source: source.score, reverse=True)[:limit]


def run_restricted_item_agent(
    db: Session,
    request: RestrictedItemCheckRequest,
) -> RestrictedItemCheckResponse:
    query_text = build_post_check_text(request)
    sources = search_restricted_trade_policies(db, query_text=query_text)
    steps = [
        AgentStep(step="rag_retrieval", detail=f"거래 제한 정책 {len(sources)}개를 검색했습니다."),
        AgentStep(step="tool_selection", detail=f"{RESTRICTED_ITEM_POLICY_TOOL} 도구를 선택했습니다."),
    ]

    result = call_policy_check_tool(request, sources)
    steps.append(AgentStep(step="observation", detail=result["message"]))
    steps.append(AgentStep(step="final_output", detail="거래 가능 여부를 구조화해서 반환했습니다."))

    matched_ids = set(result["matched_policy_ids"])
    matched_sources = [
        source for source in sources if source.policy_id in matched_ids
    ] or sources[:2]

    return RestrictedItemCheckResponse(
        status=result["status"],
        message=result["message"],
        matched_policy_titles=result["matched_policy_titles"],
        sources=matched_sources,
        agent_steps=steps,
        tool_name=RESTRICTED_ITEM_POLICY_TOOL,
        request_payload={
            "title": request.title,
            "description": request.description,
            "category": request.category,
            "policy_sources": [source.model_dump() for source in sources],
        },
    )


def call_policy_check_tool(
    request: RestrictedItemCheckRequest,
    sources: list[PolicySource],
) -> dict:
    server = LocalMcpServer()
    server.register_tool(
        McpTool(
            name=RESTRICTED_ITEM_POLICY_TOOL,
            description="Check whether a marketplace post contains restricted trade items.",
            input_schema={
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "category": {"type": "string"},
                    "policy_sources": {"type": "array"},
                },
                "required": ["title", "policy_sources"],
            },
            handler=check_restricted_item_policy,
        )
    )

    client = LocalMcpClient(server)
    response = client.call_tool(
        RESTRICTED_ITEM_POLICY_TOOL,
        {
            "title": request.title,
            "description": request.description or "",
            "category": request.category or "",
            "policy_sources": [source.model_dump() for source in sources],
        },
    )
    return response["result"]


def check_restricted_item_policy(arguments: dict) -> dict:
    post_text = normalize_text(
        " ".join(
            [
                arguments.get("title", ""),
                arguments.get("description", ""),
                arguments.get("category", ""),
            ]
        )
    )

    matched_policies = []
    for policy in RESTRICTED_TRADE_POLICIES:
        matched_keywords = [
            keyword
            for keyword in policy["keywords"]
            if normalize_text(keyword) in post_text
        ]
        if not matched_keywords:
            continue

        matched_policies.append(
            {
                "policy_id": policy["policy_id"],
                "title": policy["title"],
                "severity": policy["severity"],
                "keywords": matched_keywords,
            }
        )

    blocked_policies = [
        policy for policy in matched_policies if policy["severity"] == "blocked"
    ]
    warning_policies = [
        policy for policy in matched_policies if policy["severity"] == "warning"
    ]

    if blocked_policies:
        return {
            "status": "blocked",
            "message": "거래 제한 품목으로 의심되어 등록할 수 없습니다.",
            "matched_policy_ids": [policy["policy_id"] for policy in blocked_policies],
            "matched_policy_titles": [policy["title"] for policy in blocked_policies],
        }

    if warning_policies:
        return {
            "status": "warning",
            "message": "거래 가능 여부 확인이 필요한 품목입니다. 내용을 다시 확인해주세요.",
            "matched_policy_ids": [policy["policy_id"] for policy in warning_policies],
            "matched_policy_titles": [policy["title"] for policy in warning_policies],
        }

    return {
        "status": "allowed",
        "message": "현재 입력 내용에서는 거래 제한 품목 신호가 발견되지 않았습니다.",
        "matched_policy_ids": [],
        "matched_policy_titles": [],
    }
