from dataclasses import dataclass

from openai import OpenAI, OpenAIError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import PortfolioProject, User
from app.repositories import portfolio_repository
from app.schemas.ai import AIGenerateResponse, AIGenerationMode, AIReferenceSummary, AIOutputType
from app.services import rag_service
from app.services.portfolio_service import parse_recent_commit_summary, parse_tech_stack


class AIConfigurationError(RuntimeError):
    pass


class AIGenerationError(RuntimeError):
    pass


@dataclass
class AIContext:
    project: PortfolioProject
    linked_record_text: str
    commit_text: str
    readme_text: str


def generate_project_content(
    db: Session,
    project_id: int,
    output_type: AIOutputType,
    generation_mode: AIGenerationMode,
    current_user: User,
) -> AIGenerateResponse | None:
    """
    Generate portfolio text or interview questions from one portfolio project.

    direct: sends the selected project context directly to OpenAI.
    rag: indexes/searches project references first, then sends retrieved context.
    agent: currently delegates to direct generation until the Agent router is wired.
    """

    project = portfolio_repository.get_project_by_id(
        db=db,
        project_id=project_id,
        current_user=current_user,
    )

    if project is None:
        return None

    effective_mode: AIGenerationMode = "direct" if generation_mode == "agent" else generation_mode
    context = build_ai_context(project)
    rag_context = ""

    if effective_mode == "rag":
        try:
            rag_context = rag_service.build_rag_context(
                db=db,
                project_id=project.id,
                query=build_rag_query(context=context, output_type=output_type),
                current_user=current_user,
                top_k=5,
            )
        except rag_service.RagIndexError as error:
            raise AIGenerationError(str(error)) from error

    content = call_openai_response(
        instructions=build_system_instructions(output_type=output_type, generation_mode=effective_mode),
        input_text=build_user_prompt(
            context=context,
            output_type=output_type,
            generation_mode=effective_mode,
            rag_context=rag_context,
        ),
    )

    return AIGenerateResponse(
        project_id=project.id,
        project_title=project.title,
        output_type=output_type,
        model=settings.openai_model,
        content=content,
        references=AIReferenceSummary(
            linked_record_count=len(project.portfolio_project_posts),
            github_commit_count=len(project.github_commits),
            readme_included=bool(context.readme_text),
            rag_context_count=count_rag_blocks(rag_context),
            generation_mode=effective_mode,
        ),
    )


def build_ai_context(project: PortfolioProject) -> AIContext:
    linked_records = []

    for link in project.portfolio_project_posts:
        post = link.post

        if post is None or post.deleted_at is not None:
            continue

        category = post.category.label if post.category is not None else "record"
        linked_records.append(
            f"- [{category}] {post.title}\n"
            f"  summary: {post.summary or 'No summary.'}\n"
            f"  content: {post.content[:1000]}"
        )

    github_commits = sorted(
        project.github_commits,
        key=lambda commit: commit.committed_at or commit.created_at,
        reverse=True,
    )
    commit_lines = [f"- {commit.message}" for commit in github_commits]
    fallback_commit_lines = parse_recent_commit_summary(project.recent_commit_summary)

    return AIContext(
        project=project,
        linked_record_text="\n".join(linked_records) or "No linked JungleLog records.",
        commit_text="\n".join(commit_lines) or "\n".join(fallback_commit_lines) or "No commit messages.",
        readme_text=(project.readme_content or project.readme_summary or "").strip(),
    )


def build_system_instructions(output_type: AIOutputType, generation_mode: AIGenerationMode) -> str:
    mode_note = (
        "When RAG context is provided, prioritize the retrieved evidence over broad assumptions."
        if generation_mode == "rag"
        else "Use only the provided project data and avoid unsupported claims."
    )

    if output_type == "interview":
        return (
            "You are a technical interview coach for a Korean developer portfolio service. "
            "Write in Korean. Create practical interview questions grounded in the project evidence. "
            "Each item must have a clear question and concise POINT bullets. "
            "Do not include follow-up questions. "
            f"{mode_note}"
        )

    return (
        "You are a Korean developer portfolio writing coach. "
        "Write a polished portfolio article using Markdown headings and bullet lists. "
        "Cover problem definition, my role, implementation, troubleshooting, and lessons learned. "
        f"{mode_note}"
    )


def build_rag_query(context: AIContext, output_type: AIOutputType) -> str:
    project = context.project
    task_label = "interview questions" if output_type == "interview" else "portfolio article"

    return (
        f"{project.title} {task_label} role problem solving implementation "
        f"tech stack {project.tech_stack or ''} {project.summary or ''}"
    )


def build_user_prompt(
    context: AIContext,
    output_type: AIOutputType,
    generation_mode: AIGenerationMode,
    rag_context: str = "",
) -> str:
    project = context.project
    tech_stack = ", ".join(parse_tech_stack(project.tech_stack)) or "unknown"
    existing_portfolio = project.saved_portfolio_draft or "No saved portfolio text."

    if output_type == "interview":
        task = (
            "Create 8 Korean interview questions. "
            "Use this format for every item:\n"
            "1. question text\n"
            "POINT\n"
            "- answer point\n"
            "- answer point"
        )
    else:
        task = (
            "Write a Korean portfolio article. "
            "Use Markdown headings, natural section titles, and readable bullet lists."
        )

    return f"""
Task:
{task}

Generation mode:
- mode: {generation_mode}
- If RAG search context exists, use it as the strongest evidence.
- Do not invent facts that are not supported by the project data.

Project:
- title: {project.title}
- GitHub: {project.repo_full_name}
- branch: {project.github_branch or "main"}
- tech stack: {tech_stack}
- summary: {project.summary or "No summary."}
- coach feedback status: {project.coach_feedback_status}

Existing portfolio text:
{existing_portfolio}

Linked JungleLog records:
{context.linked_record_text}

GitHub README:
{context.readme_text or "No README content."}

GitHub commit messages:
{context.commit_text}

RAG search context:
{rag_context or "No RAG search context was used."}
""".strip()


def count_rag_blocks(rag_context: str) -> int:
    if not rag_context.strip():
        return 0

    return rag_context.count("\n\n[") + 1


def call_openai_response(instructions: str, input_text: str) -> str:
    if not settings.openai_api_key:
        raise AIConfigurationError("OPENAI_API_KEY is not configured.")

    client = OpenAI(api_key=settings.openai_api_key)

    try:
        response = client.responses.create(
            model=settings.openai_model,
            instructions=instructions,
            input=input_text,
            max_output_tokens=settings.openai_max_output_tokens,
        )
    except OpenAIError as error:
        raise AIGenerationError("OpenAI generation request failed.") from error

    content = getattr(response, "output_text", None)

    if not content:
        raise AIGenerationError("OpenAI response body was empty.")

    return content.strip()
