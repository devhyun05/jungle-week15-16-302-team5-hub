# AI 기능 구현 학습 문서

이 문서는 JungleLog에 OpenAI 기반 AI 기능을 붙이면서 함께 업데이트한다.

## 목표

- 포트폴리오 관리에 등록된 프로젝트를 기준으로 포트폴리오 글을 생성한다.
- 같은 프로젝트 자료를 기준으로 면접 예상 질문을 생성한다.
- 이후 RAG, MCP, Agent 단계로 확장할 수 있도록 AI 호출 경계를 백엔드 service로 분리한다.

## 현재 단계

### 1단계: OpenAI 기본 연결

- `.env`에 `OPENAI_API_KEY`를 추가한다.
- 백엔드 `config.py`에서 OpenAI 관련 환경변수를 읽는다.
- `ai_service.py`에서 OpenAI Responses API 호출을 담당한다.
- `ai` router에서 프론트가 호출할 API를 만든다.

## 왜 백엔드에서 OpenAI를 호출하는가

- OpenAI API key는 비밀값이므로 브라우저에 노출되면 안 된다.
- 프론트엔드는 생성 요청만 보내고, 실제 OpenAI 호출은 FastAPI 백엔드가 처리한다.
- 나중에 RAG 검색, GitHub 참고자료 구성, 권한 검증을 백엔드에서 함께 처리하기 좋다.

## 첫 AI 기능 범위

### 포트폴리오 글 생성

입력 자료:

- 프로젝트 이름
- GitHub repo / branch
- 기술 스택
- README 원문 또는 요약
- 전체 커밋 메시지
- 연결된 학습 기록
- 기존 포트폴리오 글

출력:

- 포트폴리오 글 본문

### 면접 예상 질문 생성

입력 자료:

- 프로젝트 정보
- README
- 커밋 메시지
- 연결된 학습 기록

출력:

- 예상 질문
- 답변 포인트
- 꼬리 질문

## 이번 구현에서 볼 키워드

- OpenAI API key
- FastAPI service layer
- prompt
- context
- model
- max output tokens
- backend secret management
- API response schema


## 1단계: OpenAI 기본 연결

### 구현한 것

- `backend/app/services/ai_service.py`에서 OpenAI Responses API를 호출한다.
- `POST /ai/generate`는 프로젝트 id와 생성 유형을 받아 AI 결과를 반환한다.
- 아직 RAG 검색은 하지 않고, 선택 프로젝트 자료를 직접 prompt에 넣는다.

### 현재 구조

```txt
Frontend AI Assistant
  -> POST /ai/generate
  -> ai router
  -> ai_service
  -> portfolio project / README / commits / linked records
  -> OpenAI Responses API
  -> generated text
```

### 다음 작업

- `backend/.env`에 `OPENAI_API_KEY` 설정
- Swagger에서 AI API 직접 호출
- 프론트 AI 도우미의 mock 생성 결과를 실제 `/ai/generate` 호출로 교체

## 2026-06-17: 프론트 AI 도우미 API 연결

### 구현한 것

- `frontend/src/app/api/ai.ts`를 추가해 프론트에서 백엔드 `/ai/generate`를 호출할 수 있게 했다.
- `AIAssistant.tsx`에서 `OpenAI로 생성하기` 버튼을 누르면 실제 AI API를 호출한다.
- 프로젝트 선택 또는 생성 유형 변경 시 이전 생성 결과를 초기화한다.
- 화면 진입 시 자동 호출하지 않고, 사용자가 명시적으로 버튼을 눌렀을 때만 호출한다.

### 지금 구조

```txt
AI 도우미 화면
  -> OpenAI로 생성하기 버튼
  -> frontend/src/app/api/ai.ts
  -> POST /ai/generate
  -> FastAPI ai_router
  -> ai_service
  -> OpenAI Responses API
  -> generatedText
  -> 기존 포트폴리오 프로젝트 저장 API
```

### 학습 포인트

- OpenAI API key는 프론트에 두면 안 되고 백엔드 `.env`에만 있어야 한다.
- 프론트는 `projectId`, `outputType` 같은 최소 요청값만 백엔드에 보낸다.
- 백엔드는 DB에 저장된 README, 커밋 메시지, 연결 기록을 모아 prompt를 만든다.
- 지금은 RAG 검색 없이 직접 context를 넣는 단계이고, 다음 단계에서 vector search를 붙인다.

### 현재 막힌 점

- `backend/.env`의 `OPENAI_API_KEY` 값이 비어 있어 실제 OpenAI 호출 QA는 아직 진행하지 못했다.
