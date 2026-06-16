from dataclasses import dataclass

from openai import OpenAI, OpenAIError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import PortfolioProject, User
from app.repositories import portfolio_repository
from app.schemas.ai import AIGenerateResponse, AIReferenceSummary, AIOutputType
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
    current_user: User,
) -> AIGenerateResponse | None:
    """
    선택한 포트폴리오 프로젝트 자료를 모아 OpenAI로 포트폴리오 글 또는 면접 질문을 생성한다.
    """

    project = portfolio_repository.get_project_by_id(
        db=db,
        project_id=project_id,
        current_user=current_user,
    )

    if project is None:
        return None

    context = build_ai_context(project)
    content = call_openai_response(
        instructions=build_system_instructions(output_type),
        input_text=build_user_prompt(context=context, output_type=output_type),
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
        ),
    )


def build_ai_context(project: PortfolioProject) -> AIContext:
    """
    OpenAI에 전달할 프로젝트 참고자료를 하나의 context로 정리한다.

    지금은 선택 프로젝트에 연결된 자료를 직접 넣고, RAG 단계에서는 이 함수 앞에 검색 단계를 추가한다.
    """

    linked_records = []

    for link in project.portfolio_project_posts:
        post = link.post

        if post is None or post.deleted_at is not None:
            continue

        category = post.category.label if post.category is not None else "기록"
        linked_records.append(
            f"- [{category}] {post.title}\n  요약: {post.summary or '요약 없음'}\n  내용: {post.content[:1000]}"
        )

    github_commits = sorted(
        project.github_commits,
        key=lambda commit: commit.committed_at or commit.created_at,
        reverse=True,
    )
    commit_lines = [f"- {commit.message}" for commit in github_commits]

    return AIContext(
        project=project,
        linked_record_text="\n".join(linked_records) or "연결된 학습 기록이 없습니다.",
        commit_text="\n".join(commit_lines) or "\n".join(parse_recent_commit_summary(project.recent_commit_summary)) or "수집된 커밋 메시지가 없습니다.",
        readme_text=(project.readme_content or project.readme_summary or "").strip(),
    )


def build_system_instructions(output_type: AIOutputType) -> str:
    if output_type == "interview":
        return (
            "너는 개발자 포트폴리오와 기술 면접을 도와주는 코치다. "
            "주어진 프로젝트 자료만 근거로 면접 예상 질문과 답변 포인트를 한국어로 작성한다. "
            "과장된 표현을 피하고, 사용자가 실제로 설명할 수 있는 수준으로 정리한다."
        )

    return (
        "너는 개발자 포트폴리오 글 작성을 도와주는 코치다. "
        "주어진 프로젝트 자료만 근거로 포트폴리오 글을 한국어로 작성한다. "
        "문제 정의, 나의 역할, 구현 내용, 트러블슈팅, 배운 점이 드러나게 정리한다."
    )


def build_user_prompt(context: AIContext, output_type: AIOutputType) -> str:
    project = context.project
    tech_stack = ", ".join(parse_tech_stack(project.tech_stack)) or "기술 스택 미감지"
    existing_portfolio = project.saved_portfolio_draft or "저장된 포트폴리오 글 없음"

    if output_type == "interview":
        task = (
            "아래 자료를 바탕으로 면접 예상 질문 8개를 만들어줘. "
            "각 질문마다 답변 포인트만 간결하게 정리하고, 꼬리 질문은 포함하지 마."
        )
    else:
        task = (
            "아래 자료를 바탕으로 포트폴리오 글을 작성해줘. "
            "소제목은 자연스럽게 붙이고, 지원서에 옮겨도 어색하지 않은 문장으로 정리해줘."
        )

    return f"""
작업:
{task}

프로젝트:
- 이름: {project.title}
- GitHub: {project.repo_full_name}
- Branch: {project.github_branch or "main"}
- 기술 스택: {tech_stack}
- 프로젝트 설명: {project.summary or "설명 없음"}
- 코치 피드백 상태: {project.coach_feedback_status}

기존 포트폴리오 글:
{existing_portfolio}

연결된 학습 기록:
{context.linked_record_text}

GitHub README:
{context.readme_text or "README 자료 없음"}

GitHub 커밋 메시지:
{context.commit_text}
""".strip()


def call_openai_response(instructions: str, input_text: str) -> str:
    """
    OpenAI Responses API를 호출한다.

    API key는 backend/.env에서만 읽고, 프론트엔드로 노출하지 않는다.
    """

    if not settings.openai_api_key:
        raise AIConfigurationError("OPENAI_API_KEY가 설정되어 있지 않습니다.")

    client = OpenAI(api_key=settings.openai_api_key)

    try:
        response = client.responses.create(
            model=settings.openai_model,
            instructions=instructions,
            input=input_text,
            max_output_tokens=settings.openai_max_output_tokens,
        )
    except OpenAIError as error:
        raise AIGenerationError("OpenAI 응답 생성에 실패했습니다.") from error

    content = getattr(response, "output_text", None)

    if not content:
        raise AIGenerationError("OpenAI 응답 본문이 비어 있습니다.")

    return content.strip()
