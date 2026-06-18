from typing import Any

from sqlalchemy.orm import Session

from app.db.models import User
from app.repositories import portfolio_repository
from app.services import github_service


class McpToolError(RuntimeError):
    pass


MCP_TOOLS = [
    {
        "name": "get_github_repository",
        "description": "Fetch GitHub repository metadata, README, tech stack, and commit messages.",
        "parameters": {"repo_full_name": "owner/repo", "github_branch": "optional branch name"},
    },
    {
        "name": "get_portfolio_project",
        "description": "Read a JungleLog portfolio project already stored in the database.",
        "parameters": {"project_id": "portfolio project id"},
    },
]


def handle_json_rpc(request_id: int | str | None, method: str, params: dict[str, Any], db: Session, current_user: User) -> dict[str, Any]:
    if method == "mcp.list_tools":
        return {"tools": MCP_TOOLS}

    if method == "mcp.call_tool":
        tool_name = str(params.get("name") or "")
        arguments = params.get("arguments")

        if not isinstance(arguments, dict):
            raise McpToolError("MCP tool arguments must be an object.")

        return {"tool": tool_name, "output": call_tool(tool_name=tool_name, arguments=arguments, db=db, current_user=current_user)}

    raise McpToolError(f"Unsupported MCP method: {method}")


def call_tool(tool_name: str, arguments: dict[str, Any], db: Session, current_user: User) -> dict[str, Any]:
    if tool_name == "get_github_repository":
        repo_full_name = str(arguments.get("repo_full_name") or "").strip()
        github_branch = arguments.get("github_branch")

        if not repo_full_name:
            raise McpToolError("repo_full_name is required.")

        analysis = github_service.analyze_repository(
            repo_full_name=repo_full_name,
            github_branch=str(github_branch).strip() if github_branch else None,
        )

        return {
            "title": analysis.title,
            "repo_full_name": analysis.repo_full_name,
            "github_branch": analysis.github_branch,
            "github_url": analysis.github_url,
            "summary": analysis.summary,
            "tech_stack": analysis.tech_stack,
            "readme_summary": analysis.readme_summary,
            "readme_content": analysis.readme_content,
            "commit_messages": [
                {
                    "sha": commit.sha,
                    "message": commit.message,
                    "author_name": commit.author_name,
                    "committed_at": commit.committed_at.isoformat() if commit.committed_at else None,
                    "html_url": commit.html_url,
                }
                for commit in analysis.commit_messages
            ],
        }

    if tool_name == "get_portfolio_project":
        project_id = int(arguments.get("project_id") or 0)
        project = portfolio_repository.get_project_by_id(db=db, project_id=project_id, current_user=current_user)

        if project is None:
            raise McpToolError("Portfolio project was not found.")

        return {
            "id": project.id,
            "title": project.title,
            "repo_full_name": project.repo_full_name,
            "github_branch": project.github_branch,
            "github_url": project.github_url,
            "summary": project.summary,
            "tech_stack": project.tech_stack,
            "linked_record_count": len(project.portfolio_project_posts),
            "github_commit_count": len(project.github_commits),
            "has_readme_content": bool(project.readme_content),
        }

    raise McpToolError(f"Unknown MCP tool: {tool_name}")
