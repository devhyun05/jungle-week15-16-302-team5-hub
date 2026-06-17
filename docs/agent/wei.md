# JungleLog AI 구현 기준 문서

이 문서는 팀원이 준 ProjectLens AI 파트 설명 초안을 JungleLog 과제 기준으로 바꾼 문서다. 앞으로 OpenAI, RAG, MCP, Agent를 구현할 때 `docs/agent/code.md`, `docs/agent/api-design.md`, `docs/agent/study.md`, `docs/agent/test.md`와 함께 참고한다.

## 1. 이 문서의 목적

과제에서 요구하는 AI 기능은 단순히 OpenAI API 한 번 호출하는 것이 아니다.

JungleLog에서는 아래 세 가지를 구분해서 설계하고 구현해야 한다.

```txt
RAG: 우리 서비스 데이터에서 근거를 검색한다.
MCP: 외부 시스템을 AI가 호출 가능한 도구로 연결한다.
Agent: RAG와 MCP 도구를 필요에 따라 선택하고 실행하는 루프를 관리한다.
```

즉 AI 기능을 만들 때는 항상 다음 질문을 먼저 한다.

1. 이 기능은 어떤 데이터를 근거로 삼는가?
2. 그 데이터는 RAG 검색 대상인가, 단순 context인가?
3. 외부 시스템 호출이 필요한가?
4. 필요하다면 MCP tool로 분리할 수 있는가?
5. LLM 한 번 호출이면 충분한가, Agent loop가 필요한가?
6. 실패, 비용, 권한, timeout을 어떻게 막을 것인가?

## 2. JungleLog AI 목표

JungleLog의 AI 기능은 정글 수강생의 학습 기록과 GitHub 프로젝트 정보를 바탕으로 포트폴리오 자료를 만드는 것이다.

주요 AI 기능:

- 포트폴리오 글 생성
- 면접 예상 질문 생성
- 유사 학습 기록 검색
- GitHub README/commit message 기반 프로젝트 요약
- 코치 피드백과 연결된 보완 방향 제안

AI가 참고할 수 있는 데이터:

- JungleLog 게시글
- 내 기록
- 포트폴리오 프로젝트
- 연결된 학습 기록
- GitHub README 원문
- GitHub commit message 전체
- 저장된 포트폴리오 글
- 코치 리뷰 요청과 피드백

## 2-1. AI 도우미 UI 기준

사용자 화면에서는 내부 구현 방식을 고르게 하지 않는다.

사용자가 원하는 것은 `RAG 기반 생성`이나 `Agent 기반 생성`이라는 기술 선택이 아니라 다음 두 결과물이다.

- 포트폴리오 글 만들기
- 면접 예상 질문 만들기

따라서 AI 도우미 화면은 프로젝트 선택 후 위 두 액션을 명확하게 보여준다.

두 액션 버튼은 작업 유형을 선택하는 역할만 한다. 실제 OpenAI 호출은 별도의 `생성하기` 버튼을 눌렀을 때만 실행한다. 버튼 선택만으로 비용이 발생하면 안 된다.

내부 구현 단계는 문서와 코드에서 설명한다.

- 일반 생성: 프로젝트 자료를 한 번에 prompt context에 넣는 초기 구현이다.
- RAG 생성: 자료 전체 중 관련 근거를 검색해서 prompt에 넣는 내부 구조다.
- Agent 생성: RAG 검색과 MCP tool 호출을 필요한 순서대로 실행하는 내부 루프다.

현재 JungleLog의 기본 내부 실행 순서는 다음과 같다.

```txt
Agent 기반 생성 시도
-> 실패하면 RAG 기반 생성으로 fallback
-> 다시 실패하면 direct 생성으로 fallback
```

fallback은 사용자에게 복잡한 내부 용어로 노출하지 않는다. 사용자는 `생성하기` 성공/실패만 보고, 내부 실행 경로는 로그와 문서에서 설명한다.

이 세 가지는 사용자 선택 UI가 아니라 JungleLog AI 기능을 점진적으로 고도화하는 내부 아키텍처 단계다.

화면에는 아래 문장처럼 사용자 친화적인 설명만 노출한다.

```txt
AI는 선택한 프로젝트의 GitHub README, 커밋 메시지, 연결된 JungleLog 기록, 코치 피드백을 참고해 결과를 생성합니다.
```

## 3. RAG 기준

### RAG란?

RAG는 Retrieval-Augmented Generation이다. 모델을 새로 학습시키는 것이 아니라, 답변 전에 관련 데이터를 검색해서 LLM context에 넣는 구조다.

```txt
데이터 수집
-> chunking
-> embedding
-> vector DB 저장
-> 사용자 요청 embedding
-> 유사 문서 검색
-> 검색 결과를 prompt context에 포함
-> LLM 생성
```

### JungleLog RAG 데이터 소스

v1 RAG 후보:

| 데이터 | 이유 |
| --- | --- |
| posts.content | 학습 로그, 트러블슈팅, 회고가 포트폴리오 근거가 됨 |
| portfolio_projects.readme_content | GitHub README 원문은 프로젝트 설명 근거가 됨 |
| github_commits.message | 개발 흐름과 문제 해결 흔적을 보여줌 |
| review_requests.feedback | 코치 피드백을 반영한 보완 방향 근거가 됨 |
| saved_portfolio_draft | 기존 포트폴리오 글을 갱신할 때 참고 |

### RAG 최소 구현 기준

과제에서 RAG라고 설명하려면 최소한 아래 흐름이 보여야 한다.

- 데이터 소스를 정한다.
- 검색용 문서 단위로 변환한다.
- embedding을 만든다.
- vector DB 또는 유사 검색 저장소에 저장한다.
- 질문이나 생성 요청에 맞는 문서를 검색한다.
- 검색 결과를 LLM prompt에 근거로 넣는다.
- 어떤 근거를 사용했는지 UI나 로그에 남긴다.

### JungleLog v1 선택

권장 v1:

```txt
PostgreSQL + pgvector
OpenAI embedding model
FastAPI RAG service
portfolio_project_id 기준 문서 수집
top-k 검색
출처 metadata 저장
```

초기에는 pgvector 전 단계로 텍스트 기반 검색을 먼저 만들 수 있지만, 최종 제출에는 embedding 기반 검색 구조가 보이는 편이 좋다.

## 4. MCP 기준

### MCP란?

MCP는 Model Context Protocol이다. AI가 외부 시스템을 표준화된 도구처럼 호출할 수 있게 하는 연결 방식이다.

일반 API 호출과 MCP의 차이:

```txt
일반 API 호출: 백엔드 코드가 정해진 endpoint를 직접 호출한다.
MCP: tool schema를 노출하고, Host/Client가 JSON-RPC 기반으로 Server tool을 호출한다.
```

### JungleLog MCP 후보

가장 자연스러운 MCP 대상은 GitHub다.

이미 백엔드에는 GitHub REST API 연결이 있다. AI 단계에서는 이것을 MCP tool 또는 MCP-like tool로 분리해서 설명할 수 있다.

MCP tool 후보:

| Tool | 역할 |
| --- | --- |
| `get_github_repo_info` | repo 이름, 설명, 기본 branch 조회 |
| `get_github_readme` | README 원문 조회 |
| `get_github_commits` | commit message 목록 조회 |
| `get_portfolio_project` | JungleLog 프로젝트 정보 조회 |
| `search_junglelog_records` | JungleLog 기록 검색 |

### MCP 최소 구현 기준

- MCP Server 역할을 하는 코드가 있다.
- tool schema가 정의되어 있다.
- JSON-RPC 기반 요청/응답 구조를 설명하거나 구현한다.
- 실제 외부 서비스 1개 이상을 호출한다.
- API key와 권한 관리 전략이 있다.
- tool 호출 결과를 evidence로 저장하거나 로그로 확인할 수 있다.

### JungleLog v1 선택

권장 v1:

```txt
backend/app/mcp_server 또는 backend/app/mcp_tools 구조 생성
GitHub 조회 tool 1~3개 구현
JSON-RPC request/response 형식 문서화
Agent가 직접 OpenAI tool calling으로 호출하거나 backend function wrapper로 호출
GitHub token은 backend .env에서만 관리
```

주의:

- GitHub token은 프론트로 절대 보내지 않는다.
- LLM이 임의 URL을 호출하게 두면 SSRF 위험이 생긴다.
- URL은 GitHub host인지 검증한다.
- tool 결과는 instruction이 아니라 evidence로만 사용한다.

## 5. Agent 기준

### Agent란?

Agent는 LLM 호출 하나가 아니라 목표, 도구, 상태, 반복 루프를 가진 실행 구조다.

```txt
Goal
-> Think
-> Tool 선택
-> Tool 실행
-> Observation 확인
-> 다시 판단
-> Final Output
```

### JungleLog Agent 역할

포트폴리오 글 생성 Agent 예시:

```txt
사용자: 이 프로젝트 포트폴리오 글 만들어줘
-> project_id 확인
-> 프로젝트 DB 조회
-> README/commit message 존재 여부 확인
-> 부족하면 GitHub MCP tool 호출
-> 연결된 학습 기록 RAG 검색
-> 근거 자료를 정리
-> OpenAI로 포트폴리오 글 생성
-> 결과 저장
-> 사용한 근거와 상태 반환
```

면접 질문 생성 Agent 예시:

```txt
project_id 확인
-> 기술 스택 확인
-> README/commit message 확인
-> 트러블슈팅/회고 기록 RAG 검색
-> 질문 유형 생성
-> 예상 질문/답변 포인트/꼬리 질문 생성
-> 프로젝트에 저장
```

### Agent 최소 구현 기준

- function calling 또는 tool calling 구조가 있다.
- Agent state가 있다.
- 사용 가능한 tool 목록이 있다.
- tool 결과 observation을 다음 판단에 반영한다.
- max turns 또는 timeout으로 무한 루프를 막는다.
- 예외 처리와 실패 상태가 있다.
- 최종 결과가 structured output으로 나온다.

### JungleLog Agent state 예시

```ts
type AgentRunState = {
  runId: string;
  userId: number;
  projectId: number;
  taskType: "portfolio_draft" | "interview_questions";
  status: "running" | "completed" | "failed";
  turns: number;
  maxTurns: number;
  evidenceIds: number[];
  output?: string;
  errorMessage?: string;
};
```

## 6. OpenAI API 사용 기준

OpenAI API key는 backend에서만 사용한다.

프론트는 아래처럼 요청만 보낸다.

```txt
POST /ai/generate
{
  "projectId": 1,
  "taskType": "portfolio_draft"
}
```

백엔드가 하는 일:

```txt
권한 확인
-> 프로젝트 조회
-> RAG 검색
-> 필요하면 MCP tool 호출
-> OpenAI 호출
-> 결과 저장
-> 응답 반환
```

주의:

- ChatGPT Plus와 OpenAI API 과금은 별도다.
- 입력 token과 출력 token 모두 비용에 영향을 준다.
- Agent는 tool 호출과 재시도로 비용이 커질 수 있다.
- `max_output_tokens`, `max_turns`, timeout을 둔다.
- OpenAI usage dashboard와 billing limit을 확인한다.

## 7. 비용/보안/운영 체크리스트

AI 구현 전 체크:

- [ ] `OPENAI_API_KEY`는 backend `.env`에만 있다.
- [ ] `.env.example`에는 placeholder만 있다.
- [ ] AI API는 로그인 사용자만 호출할 수 있다.
- [ ] project owner 또는 ADMIN만 해당 프로젝트 AI 생성이 가능하다.
- [ ] GitHub token은 backend에서만 사용한다.
- [ ] 외부 URL은 GitHub URL로 제한한다.
- [ ] max turns가 있다.
- [ ] timeout이 있다.
- [ ] 실패 상태를 UI에 보여준다.
- [ ] 사용한 근거 자료를 저장하거나 확인할 수 있다.
- [ ] 비용 폭주를 막기 위한 제한이 있다.

## 7-1. 알림과 상태 동기화 기준

AI/리뷰/승인 이벤트는 사용자가 나중에 다시 확인해야 하는 경우 저장 알림으로 남긴다.

저장 알림 대상:

- 학생: 코치 리뷰 상태 변경, 수정 요청, 피드백 완료, 포트폴리오 게시글 발행/갱신, AI 생성 완료, 관리자 승인/정지/거절
- 코치: 학생의 코치 리뷰 요청, 학생의 요청 취소
- 관리자: 새 사용자의 승인 대기 진입

오류나 입력 누락은 저장 알림이 아니라 toast로 처리한다.

포트폴리오 프로젝트 대상 코치 리뷰는 review request 상태와 `portfolio_projects.coach_feedback_status`를 함께 갱신한다.

```txt
리뷰 요청 생성 -> 요청함
코치 검토 중 전송 -> 검토 중
코치 수정 요청 전송 -> 수정 요청
코치 피드백 완료 전송 -> 피드백 완료
학생 대기 요청 취소 -> 요청 전
```

게시글 대상 리뷰 요청은 게시글 상태만 관리하고, 포트폴리오 프로젝트 상태는 갱신하지 않는다.

## 8. 구현 순서 제안

AI 단계는 아래 순서로 가는 것이 안전하다.

### 1단계: OpenAI 단일 호출

목표:

- 선택한 프로젝트 데이터를 prompt에 넣고 포트폴리오 글/면접 질문을 생성한다.

완료 기준:

- `/ai/generate` API가 있다.
- 프론트 AI 도우미가 실제 API를 호출한다.
- 결과가 프로젝트에 저장된다.
- RAG/MCP/Agent는 아직 구조만 남겨도 된다.

### 2단계: RAG 검색 붙이기

목표:

- 연결된 게시글, README, commit message를 검색 근거로 사용한다.

완료 기준:

- RAG document 저장 구조가 있다.
- embedding 생성 API 또는 indexing job이 있다.
- top-k 검색 결과가 prompt에 들어간다.
- 출처가 응답에 포함된다.

### 3단계: MCP tool 붙이기

목표:

- GitHub 조회 기능을 MCP tool로 분리한다.

완료 기준:

- MCP Server 또는 MCP-like tool wrapper가 있다.
- JSON-RPC 요청/응답 또는 tool schema가 문서화되어 있다.
- GitHub 외부 API 호출 결과가 evidence로 남는다.

### 4단계: Agent loop 만들기

목표:

- Agent가 RAG 검색과 MCP tool 호출을 선택해서 최종 결과를 만든다.

완료 기준:

- Agent run state가 있다.
- max turns가 있다.
- tool call과 observation 로그가 있다.
- structured output으로 결과를 저장한다.

## 9. README에 설명할 문장

README에는 아래처럼 설명하면 좋다.

```txt
JungleLog의 AI 기능은 OpenAI API 단일 호출에 그치지 않고, RAG/MCP/Agent 구조로 확장되도록 설계했습니다.
RAG는 JungleLog 게시글, GitHub README 원문, commit message를 검색 근거로 사용합니다.
MCP는 GitHub 같은 외부 시스템을 AI가 호출 가능한 tool로 연결합니다.
Agent는 프로젝트 정보 확인, RAG 검색, MCP tool 호출, 결과 생성과 저장을 하나의 상태 기반 루프로 관리합니다.
```

## 10. 구현할 때 항상 확인할 것

AI 관련 코드를 작성할 때는 아래 문서를 함께 본다.

- `docs/agent/code.md`: 코드 컨벤션
- `docs/agent/api-design.md`: API 계약
- `docs/agent/db-design.md`: DB 설계
- `docs/agent/back-keyword.md`: 백엔드 키워드
- `docs/agent/study.md`: 학습 정리
- `docs/agent/test.md`: QA 체크리스트
- `docs/agent/troubleshooting.md`: 문제 해결 기록
- `docs/agent/wei.md`: AI 구현 기준

작업 완료 후에는 아래를 업데이트한다.

- `README.md`
- `docs/agent/log.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- 필요하면 `docs/agent/api-design.md`, `docs/agent/db-design.md`, `docs/agent/back-keyword.md`

## 11. 기억할 한 문장

```txt
RAG는 검색, MCP는 연결, Agent는 루프다.
```

JungleLog에서는 이 세 가지가 아래처럼 합쳐진다.

```txt
포트폴리오 생성 요청
-> RAG로 JungleLog 기록 검색
-> MCP로 GitHub 자료 확인
-> Agent가 필요한 도구를 선택하고 결과를 저장
```
