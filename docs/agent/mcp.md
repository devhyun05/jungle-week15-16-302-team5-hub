# MCP 구현 학습 문서

이 문서는 JungleLog에 MCP 기능을 구현하면서 업데이트한다.

## MCP란?

MCP는 Model Context Protocol의 약자다.

LLM이나 Agent가 외부 도구를 표준 방식으로 호출할 수 있게 해주는 프로토콜이다.

## JungleLog에서 MCP가 맡을 역할

현재 GitHub REST API 연동은 FastAPI service 안에 직접 구현되어 있다.

MCP 단계에서는 이 GitHub 조회 기능을 tool 형태로 분리해, AI/Agent가 필요할 때 호출할 수 있게 만든다.

## MCP tool 후보

- `get_github_repo_info`
- `get_github_readme`
- `get_github_commits`
- `search_junglelog_posts`
- `get_portfolio_project`

## 구현 예정 순서

1. MCP server의 역할과 JSON-RPC 요청/응답 구조를 정리한다.
2. GitHub 조회 기능 중 하나를 MCP tool로 분리한다.
3. FastAPI 또는 별도 프로세스에서 MCP server를 실행하는 방식을 결정한다.
4. Agent가 MCP tool을 호출할 수 있도록 연결한다.

## 이번 구현에서 볼 키워드

- MCP server
- JSON-RPC
- tool
- external system
- API key boundary
- GitHub API
- function calling과 MCP 차이

