import base64
import re
from dataclasses import dataclass
from datetime import datetime
from typing import Any
from urllib.parse import quote

import httpx

from app.core.config import settings


class GitHubRepositoryNotFoundError(Exception):
    """
    GitHub에 해당 owner/repo가 없거나 현재 token 권한으로 볼 수 없을 때 사용한다.
    """


class GitHubApiError(Exception):
    """
    GitHub API가 rate limit, 장애, 인증 문제 등으로 정상 응답하지 못할 때 사용한다.
    """


@dataclass
class GitHubRepositoryAnalysis:
    """
    GitHub API 여러 응답을 포트폴리오 프로젝트에 저장하기 좋은 형태로 모은 값이다.

    라우터나 repository가 GitHub 원본 JSON 구조를 직접 알지 않게 하려고
    service 계층에서 명시적인 dataclass로 한 번 정리한다.
    """

    title: str
    repo_full_name: str
    github_branch: str
    github_url: str
    summary: str | None
    tech_stack: list[str]
    readme_summary: str | None
    recent_commit_summary: list[str]
    last_commit_at: datetime | None


def analyze_repository(repo_full_name: str, github_branch: str | None = None) -> GitHubRepositoryAnalysis:
    """
    GitHub repo 하나를 조회해서 JungleLog 포트폴리오에 필요한 정보로 변환한다.

    현재는 public repository 기준으로 동작한다.
    GITHUB_TOKEN을 .env에 넣으면 private repository나 더 높은 rate limit에도 대응할 수 있다.
    """

    normalized_repo_full_name = repo_full_name.strip().strip("/")

    if not normalized_repo_full_name or "/" not in normalized_repo_full_name:
        raise GitHubRepositoryNotFoundError("GitHub repo는 owner/repository 형식이어야 합니다.")

    with httpx.Client(base_url=settings.github_api_base_url, timeout=10.0, headers=build_github_headers()) as client:
        repository_data = get_github_json(client, f"/repos/{normalized_repo_full_name}")
        effective_branch = get_effective_branch(repository_data=repository_data, github_branch=github_branch)
        readme_data = get_optional_github_json(
            client,
            f"/repos/{normalized_repo_full_name}/readme",
            params={"ref": effective_branch},
        )
        commit_data = get_github_json(
            client,
            f"/repos/{normalized_repo_full_name}/commits",
            params={"per_page": 5, "sha": effective_branch},
        )
        language_data = get_optional_github_json(client, f"/repos/{normalized_repo_full_name}/languages")
        tree_data = get_optional_github_json(
            client,
            f"/repos/{normalized_repo_full_name}/git/trees/{quote(effective_branch, safe='')}",
            params={"recursive": 1},
        )

    repository_name = str(repository_data.get("name") or normalized_repo_full_name.split("/")[-1])
    full_name = str(repository_data.get("full_name") or normalized_repo_full_name).lower()
    github_url = str(repository_data.get("html_url") or f"https://github.com/{normalized_repo_full_name}")
    summary = repository_data.get("description")

    return GitHubRepositoryAnalysis(
        title=repository_name,
        repo_full_name=full_name,
        github_branch=effective_branch,
        github_url=github_url,
        summary=str(summary).strip() if summary else None,
        tech_stack=build_tech_stack(
            repository_data=repository_data,
            language_data=language_data,
            tree_data=tree_data,
        ),
        readme_summary=build_readme_summary(readme_data),
        recent_commit_summary=build_recent_commit_summary(commit_data),
        last_commit_at=get_last_commit_at(commit_data),
    )


def get_effective_branch(repository_data: dict[str, Any] | list[dict[str, Any]], github_branch: str | None) -> str:
    """
    사용자가 branch를 입력하지 않았으면 GitHub repository의 default branch를 사용한다.
    """

    if github_branch and github_branch.strip():
        return github_branch.strip()

    if isinstance(repository_data, dict):
        default_branch = repository_data.get("default_branch")

        if default_branch:
            return str(default_branch).strip()

    return "main"


def build_github_headers() -> dict[str, str]:
    """
    GitHub REST API 권장 header를 만든다.

    Authorization header는 선택이다.
    공개 repo만 조회할 때는 token 없이도 동작하지만, private repo나 rate limit 완화를 위해 token을 붙일 수 있다.
    """

    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": settings.github_api_version,
        "User-Agent": "JungleLog",
    }

    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"

    return headers


def get_github_json(
    client: httpx.Client,
    path: str,
    params: dict[str, str | int] | None = None,
) -> dict[str, Any] | list[dict[str, Any]]:
    """
    GitHub API를 호출하고 JSON 응답을 반환한다.
    """

    try:
        response = client.get(path, params=params)
    except httpx.HTTPError as error:
        raise GitHubApiError("GitHub API에 연결하지 못했습니다.") from error

    if response.status_code == 404:
        raise GitHubRepositoryNotFoundError("GitHub 저장소를 찾을 수 없습니다.")

    if response.status_code == 403:
        raise GitHubApiError("GitHub API 요청 한도를 초과했거나 접근 권한이 없습니다.")

    if response.status_code >= 400:
        raise GitHubApiError("GitHub API 요청에 실패했습니다.")

    try:
        return response.json()
    except ValueError as error:
        raise GitHubApiError("GitHub API 응답을 해석하지 못했습니다.") from error


def get_optional_github_json(
    client: httpx.Client,
    path: str,
    params: dict[str, str | int] | None = None,
) -> dict[str, Any] | list[dict[str, Any]] | None:
    """
    README, commits, languages처럼 없어도 프로젝트 등록은 가능한 정보를 조회한다.
    """

    try:
        return get_github_json(client, path, params=params)
    except GitHubRepositoryNotFoundError:
        return None


def build_tech_stack(
    repository_data: dict[str, Any],
    language_data: dict[str, Any] | list[dict[str, Any]] | None,
    tree_data: dict[str, Any] | list[dict[str, Any]] | None,
) -> list[str]:
    """
    GitHub tree 또는 languages API 응답을 기술 스택 후보로 바꾼다.

    languages API는 repo 전체 기준이라 branch별 언어를 직접 제공하지 않는다.
    그래서 branch tree를 읽을 수 있으면 파일 확장자 기반으로 먼저 추정하고,
    tree 조회가 어렵거나 정보가 부족하면 languages API 결과를 fallback으로 사용한다.
    """

    branch_tech_stack = build_tech_stack_from_tree(tree_data)

    if branch_tech_stack:
        return branch_tech_stack

    if isinstance(language_data, dict) and language_data:
        sorted_languages = sorted(language_data.items(), key=lambda item: int(item[1]), reverse=True)
        return [language for language, _bytes in sorted_languages[:5]]

    primary_language = repository_data.get("language")

    if primary_language:
        return [str(primary_language)]

    return ["GitHub"]


def build_tech_stack_from_tree(tree_data: dict[str, Any] | list[dict[str, Any]] | None) -> list[str]:
    """
    선택된 branch의 git tree에서 파일 확장자를 보고 기술 스택을 추정한다.
    """

    if not isinstance(tree_data, dict):
        return []

    tree_items = tree_data.get("tree")

    if not isinstance(tree_items, list):
        return []

    extension_counts: dict[str, int] = {}

    for item in tree_items:
        if not isinstance(item, dict):
            continue

        if item.get("type") != "blob":
            continue

        path = str(item.get("path") or "")
        language = get_language_from_path(path)

        if language:
            extension_counts[language] = extension_counts.get(language, 0) + 1

    sorted_languages = sorted(extension_counts.items(), key=lambda item: item[1], reverse=True)

    return [language for language, _count in sorted_languages[:5]]


def get_language_from_path(path: str) -> str | None:
    """
    파일 경로를 간단한 기술 스택 이름으로 매핑한다.
    """

    extension_map = {
        ".py": "Python",
        ".ts": "TypeScript",
        ".tsx": "TypeScript",
        ".js": "JavaScript",
        ".jsx": "JavaScript",
        ".java": "Java",
        ".kt": "Kotlin",
        ".go": "Go",
        ".rs": "Rust",
        ".c": "C",
        ".cpp": "C++",
        ".cs": "C#",
        ".php": "PHP",
        ".rb": "Ruby",
        ".swift": "Swift",
        ".html": "HTML",
        ".css": "CSS",
        ".scss": "SCSS",
        ".sql": "SQL",
        ".md": "Markdown",
        ".yml": "YAML",
        ".yaml": "YAML",
        ".json": "JSON",
    }
    lowered_path = path.lower()

    for extension, language in extension_map.items():
        if lowered_path.endswith(extension):
            return language

    return None


def build_readme_summary(readme_data: dict[str, Any] | list[dict[str, Any]] | None) -> str | None:
    """
    GitHub README 원문을 화면/AI 참고용 짧은 요약 텍스트로 줄인다.

    아직 AI 요약을 붙이지 않은 단계라, markdown의 주요 앞부분을 정리해서 저장한다.
    """

    if not isinstance(readme_data, dict):
        return None

    encoded_content = readme_data.get("content")
    encoding = readme_data.get("encoding")

    if not encoded_content or encoding != "base64":
        return None

    try:
        decoded_readme = base64.b64decode(str(encoded_content).replace("\n", "")).decode("utf-8", errors="ignore")
    except ValueError:
        return None

    readable_lines = []

    for raw_line in decoded_readme.splitlines():
        line = normalize_markdown_line(raw_line)

        if line:
            readable_lines.append(line)

        if len(readable_lines) >= 10:
            break

    if not readable_lines:
        return None

    summary = "\n".join(readable_lines)

    if len(summary) > 1000:
        return f"{summary[:1000].rstrip()}..."

    return summary


def normalize_markdown_line(raw_line: str) -> str:
    """
    README 일부를 보여줄 때 너무 거친 markdown 기호를 줄인다.
    """

    line = raw_line.strip()

    if not line:
        return ""

    line = re.sub(r"^#{1,6}\s*", "", line)
    line = re.sub(r"^[-*]\s+", "", line)
    line = re.sub(r"`{1,3}", "", line)
    line = re.sub(r"\[(.*?)\]\((.*?)\)", r"\1", line)

    return line.strip()


def build_recent_commit_summary(commit_data: dict[str, Any] | list[dict[str, Any]] | None) -> list[str]:
    """
    최근 커밋 목록을 UI에 바로 보여줄 수 있는 문자열 배열로 바꾼다.
    """

    if not isinstance(commit_data, list):
        return []

    summaries = []

    for commit_item in commit_data[:5]:
        commit = commit_item.get("commit", {})
        message = str(commit.get("message") or "").splitlines()[0].strip()
        committed_at = commit.get("committer", {}).get("date") or commit.get("author", {}).get("date")
        short_sha = str(commit_item.get("sha") or "")[:7]
        date_label = parse_github_datetime(committed_at)
        prefix = date_label.strftime("%Y-%m-%d") if date_label else "날짜 없음"

        if message:
            summaries.append(f"{prefix} {short_sha} {message}".strip())

    return summaries


def get_last_commit_at(commit_data: dict[str, Any] | list[dict[str, Any]] | None) -> datetime | None:
    """
    가장 최근 커밋 시각을 datetime으로 반환한다.
    """

    if not isinstance(commit_data, list) or not commit_data:
        return None

    commit = commit_data[0].get("commit", {})
    committed_at = commit.get("committer", {}).get("date") or commit.get("author", {}).get("date")

    return parse_github_datetime(committed_at)


def parse_github_datetime(value: Any) -> datetime | None:
    """
    GitHub의 ISO datetime 문자열을 Python datetime으로 바꾼다.
    """

    if not value:
        return None

    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
