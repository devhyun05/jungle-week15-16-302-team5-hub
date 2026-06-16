from sqlalchemy.orm import Session

from app.db.models import User
from app.schemas.agent import AgentToolCall
from app.schemas.ai import AIOutputType
from app.services import ai_service, mcp_service, rag_service


class AgentRunError(RuntimeError):
    pass


def run_project_agent(
    db: Session,
    project_id: int,
    output_type: AIOutputType,
    user_goal: str,
    max_iterations: int,
    current_user: User,
) -> tuple[str, list[AgentToolCall], str]:
    """
    Runs a small bounded Agent loop for the assignment requirement.

    The loop is intentionally explicit:
    1. inspect project data through an MCP-style tool,
    2. retrieve evidence through RAG,
    3. generate the requested AI artifact.

    This keeps the Agent understandable for learning and prevents infinite loops.
    """

    tool_calls: list[AgentToolCall] = []
    step = 1

    if step > max_iterations:
        raise AgentRunError("Agent max iterations were too low to inspect the project.")

    try:
        project_info = mcp_service.call_tool(
            tool_name="get_portfolio_project",
            arguments={"project_id": project_id},
            db=db,
            current_user=current_user,
        )
    except mcp_service.McpToolError as error:
        raise AgentRunError(str(error)) from error

    tool_calls.append(
        AgentToolCall(
            step=step,
            tool_name="get_portfolio_project",
            status="success",
            summary=f"Loaded project {project_info.get('title')} with {project_info.get('linked_record_count')} linked records.",
        ),
    )
    step += 1

    if step <= max_iterations:
        rag_query = user_goal or f"{project_info.get('title')} portfolio evidence and troubleshooting"

        try:
            _project, rag_results = rag_service.search_project_documents(
                db=db,
                project_id=project_id,
                query=rag_query,
                current_user=current_user,
                top_k=5,
            )
        except rag_service.RagIndexError as error:
            raise AgentRunError(str(error)) from error

        tool_calls.append(
            AgentToolCall(
                step=step,
                tool_name="rag_search",
                status="success",
                summary=f"Retrieved {len(rag_results)} evidence chunks for generation.",
            ),
        )
        step += 1

    if step > max_iterations:
        return "", tool_calls, "max_iterations_reached_before_generation"

    result = ai_service.generate_project_content(
        db=db,
        project_id=project_id,
        output_type=output_type,
        generation_mode="rag",
        current_user=current_user,
    )

    if result is None:
        raise AgentRunError("Portfolio project was not found.")

    tool_calls.append(
        AgentToolCall(
            step=step,
            tool_name="generate_project_content",
            status="success",
            summary=f"Generated {output_type} content with RAG context.",
        ),
    )

    return result.content, tool_calls, "completed"
