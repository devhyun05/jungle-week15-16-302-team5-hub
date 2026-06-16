# AI Agent 구현 학습 문서

## Agent 역할

Agent는 단순히 prompt를 한 번 보내는 기능이 아니라, 목표를 달성하기 위해 필요한 도구를 선택하고 실행하는 흐름이다.

JungleLog에서 Agent는 다음 일을 수행한다.

1. 포트폴리오 프로젝트 정보를 조회한다.
2. RAG 검색으로 관련 근거를 찾는다.
3. 근거를 포함해 포트폴리오 글 또는 면접 질문을 생성한다.
4. 어떤 도구를 실행했는지 tool call 로그를 남긴다.

## 이번 구현

### 추가 파일

- `backend/app/schemas/agent.py`
  - Agent request/response schema.
- `backend/app/services/agent_service.py`
  - 제한된 Agent loop.
- `backend/app/routers/agent.py`
  - `/ai/agent/run` endpoint.

### API

```txt
POST /ai/agent/run
```

요청 예시:

```json
{
  "project_id": 1,
  "output_type": "portfolio",
  "user_goal": "프로젝트 포트폴리오 글을 만들어줘",
  "max_iterations": 3
}
```

응답에는 `final_content`와 `tool_calls`가 포함된다.

## Agent loop

현재 v1 loop:

```txt
1. get_portfolio_project
2. rag_search
3. generate_project_content
```

이 구조는 고정된 최소 Agent다. 완전 자율형은 아니지만, 과제에서 요구한 “도구 선택과 실행 흐름”, “상태 관리”, “무한 루프 방지”를 학습하기 좋게 드러낸다.

## 무한 루프 방지

- `max_iterations`는 1~5로 제한한다.
- 기본값은 3이다.
- 생성 단계에 도달하기 전에 반복 횟수가 끝나면 `max_iterations_reached_before_generation`으로 종료한다.

## 비용 안전 기준

Agent는 내부에서 RAG embedding과 OpenAI generation을 호출할 수 있다.

따라서 자동 QA에서는 `/ai/agent/run`을 실제 실행하지 않았다.

실제 Agent 호출 QA는 사용자가 명시적으로 허락한 뒤 진행한다.

## 한계와 개선

현재 Agent는 deterministic tool loop다.

추후 개선:

- OpenAI tool/function calling 기반으로 tool 선택을 모델에게 맡기기
- tool result를 memory/state에 누적
- tool별 timeout/retry 추가
- 저장 도구 `save_ai_result` 추가
- Agent 실행 로그를 DB에 저장

## 검증 결과

```txt
backend compileall app: success
frontend npm run build: success
FastAPI app import: success
registered route: /ai/agent/run
```
