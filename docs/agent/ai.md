# OpenAI 기능 구현 학습 문서

## 목표

JungleLog의 AI 도우미는 포트폴리오 관리에 등록된 프로젝트를 기반으로 다음 결과를 생성한다.

- 포트폴리오 글
- 면접 예상 질문

입력 자료:

- 포트폴리오 프로젝트 정보
- GitHub repo/branch
- README 원문
- commit message 전체
- 기술 스택
- 연결된 학습 기록
- 기존 저장 포트폴리오 글
- 기존 저장 면접 예상 질문

## 구현 파일

- `backend/app/routers/ai.py`
  - `POST /ai/generate` endpoint.
- `backend/app/services/ai_service.py`
  - OpenAI prompt 구성과 Responses API 호출.
- `backend/app/schemas/ai.py`
  - AI request/response schema.
- `frontend/src/app/api/ai.ts`
  - 프론트 AI API client.
- `frontend/src/app/pages/ai/AIAssistant.tsx`
  - AI 도우미 화면.

## 생성 방식

### direct

선택한 프로젝트 자료를 직접 prompt에 넣어 OpenAI에 보낸다.

### rag

RAG 검색 context를 추가한 뒤 OpenAI에 보낸다.

흐름:

```txt
project data -> RAG index/search -> retrieved context -> OpenAI prompt
```

### agent

Agent endpoint를 통해 tool loop를 실행한다.

흐름:

```txt
get_portfolio_project -> rag_search -> generate_project_content
```

## 비용 안전 기준

OpenAI generation과 embedding은 API 비용이 발생한다.

따라서 자동 QA에서는 실제 OpenAI API를 반복 호출하지 않는다.

실제 호출 QA는 사용자가 명시적으로 허락한 뒤 대표 경로부터 최소 횟수로 확인한다.

- direct 포트폴리오 글 생성
- direct 면접 질문 생성
- RAG 기반 포트폴리오 글 생성
- Agent 기반 생성과 tool call 로그 표시

## 검증 결과

```txt
frontend npm run build: success
backend compileall app: success
FastAPI app import: success
registered route: /ai/generate
registered route: /ai/rag/index
registered route: /ai/rag/search
registered route: /ai/agent/run
```

## 2026-06-17 실제 호출 QA

사용자 허락 후 비용이 발생하는 실제 호출을 최소 1회 수행했다.

대표 경로는 Agent 기반 면접 질문 생성으로 잡았다. 이 한 번의 호출 안에서 RAG embedding/search, MCP tool, OpenAI generation을 함께 확인할 수 있기 때문이다.

```txt
project: ai-board-lab
output_type: interview
rag_indexed_count: 10
agent_tool_calls: get_portfolio_project -> rag_search -> generate_project_content
agent_stopped_reason: completed
generated_content_length: 1142
```

남은 수동 QA 후보:

- 프론트 AI 도우미 버튼으로 direct 생성 확인
- 프론트 AI 도우미 버튼으로 RAG 생성 확인
- 프론트 AI 도우미 버튼으로 Agent 생성 결과와 tool call 로그 표시 확인

## 학습 키워드

- OpenAI Responses API
- prompt engineering
- generation mode
- embedding
- RAG context
- tool calling
- Agent loop
- token/cost guardrail
