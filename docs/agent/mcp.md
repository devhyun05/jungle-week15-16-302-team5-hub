# MCP 구현 학습 문서

## MCP 역할

MCP는 LLM 또는 Agent가 외부 시스템을 정해진 프로토콜로 호출할 수 있게 하는 구조다.

JungleLog에서는 GitHub 외부 데이터를 가져오는 기능을 MCP tool 형태로 감쌌다.

## 이번 구현

### 추가 파일

- `backend/app/schemas/mcp.py`
  - JSON-RPC request/response schema.
- `backend/app/services/mcp_service.py`
  - MCP method와 tool 실행 로직.
- `backend/app/routers/mcp.py`
  - `/mcp` endpoint.

### API

```txt
POST /mcp
```

요청은 JSON-RPC 2.0 형태다.

도구 목록 조회:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "mcp.list_tools",
  "params": {}
}
```

도구 호출:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "mcp.call_tool",
  "params": {
    "name": "get_portfolio_project",
    "arguments": {
      "project_id": 1
    }
  }
}
```

## 구현한 MCP tool

### get_github_repository

GitHub REST API를 호출해서 repository 정보를 가져온다.

반환 데이터:

- title
- repo_full_name
- github_branch
- github_url
- summary
- tech_stack
- readme_summary
- readme_content
- commit_messages

### get_portfolio_project

DB에 저장된 포트폴리오 프로젝트 정보를 가져온다.

반환 데이터:

- id
- title
- repo_full_name
- github_branch
- github_url
- summary
- tech_stack
- linked_record_count
- github_commit_count
- has_readme_content

## 권한 관리

`/mcp` endpoint는 `STUDENT`, `ADMIN`만 호출할 수 있다.

GitHub API Key는 프론트에 노출하지 않고 backend `.env`의 `GITHUB_TOKEN`을 사용한다.

## 한계와 개선

현재 구현은 과제 요구사항을 만족하기 위한 MCP-like JSON-RPC server다.

추후 개선:

- 표준 MCP SDK 기반 서버로 분리
- stdio 또는 SSE transport 지원
- tool schema를 더 엄격하게 정의
- Agent와 MCP server를 별도 프로세스로 분리

## 검증 결과

```txt
backend compileall app: success
FastAPI app import: success
registered route: /mcp
```
