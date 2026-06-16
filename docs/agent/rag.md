# RAG 구현 학습 문서

## RAG 역할

RAG는 LLM이 답변을 만들기 전에 우리 서비스 데이터를 먼저 검색해서 근거 자료로 넣는 구조다.

JungleLog에서는 포트폴리오 글과 면접 질문을 만들 때 다음 데이터를 검색 대상으로 사용한다.

- GitHub README 원문
- GitHub commit message 전체
- 포트폴리오 프로젝트에 연결된 학습 기록
- 저장된 포트폴리오 글
- 저장된 면접 예상 질문

## 이번 구현

### 추가 파일

- `backend/app/db/models/rag_document.py`
  - RAG 검색 대상 chunk와 embedding을 저장하는 DB 모델.
- `backend/app/repositories/rag_repository.py`
  - RAG 문서 삭제, 생성, 조회 repository.
- `backend/app/services/rag_service.py`
  - 프로젝트 자료를 chunk로 나누고 embedding을 만들고 검색하는 service.
- `backend/app/schemas/rag.py`
  - RAG index/search API request/response schema.
- `backend/app/routers/rag.py`
  - `/ai/rag/index`, `/ai/rag/search` endpoint.

### API

```txt
POST /ai/rag/index
POST /ai/rag/search
```

### DB 구조

`rag_documents` 테이블을 추가했다.

주요 필드:

- `project_id`: 어떤 포트폴리오 프로젝트의 RAG 문서인지 구분.
- `owner_id`: 접근 권한 확인을 위한 사용자 id.
- `source_type`: `github_readme`, `github_commit`, `linked_post`, `saved_portfolio`, `saved_interview`.
- `source_id`: 원본 자료 식별자.
- `title`: 검색 결과에 보여줄 제목.
- `content`: 실제 검색/생성에 사용할 chunk 본문.
- `embedding_json`: OpenAI embedding vector를 JSON 문자열로 저장.
- `token_estimate`: 대략적인 토큰 수 추정값.

## 왜 PostgreSQL 테이블을 썼나

과제에서는 Pinecone, FAISS, ChromaDB, pgvector 같은 선택지가 있다.

이번 v1에서는 이미 PostgreSQL을 사용하고 있으므로 별도 인프라를 늘리지 않고 `rag_documents` 테이블을 vector store처럼 사용했다.

현재 방식:

```txt
text chunk -> OpenAI embedding -> PostgreSQL embedding_json 저장 -> Python cosine similarity 검색
```

장점:

- 로컬 개발 환경이 단순하다.
- DB와 권한 흐름이 기존 프로젝트와 잘 맞는다.
- RAG 구조를 학습하기 쉽다.

한계:

- 데이터가 많아지면 Python에서 모든 embedding을 비교하므로 느려진다.
- 실제 서비스에서는 `pgvector` extension으로 index를 만들거나 전용 Vector DB를 쓰는 편이 좋다.

## AI 생성과 연결된 흐름

`POST /ai/generate`에 `generation_mode: "rag"`를 보내면:

1. 선택한 프로젝트를 조회한다.
2. 프로젝트 자료를 RAG 문서로 색인한다. 이미 없으면 자동 색인한다.
3. 생성 목적에 맞는 query를 만든다.
4. `/ai/rag/search`와 같은 방식으로 관련 chunk를 찾는다.
5. 검색 결과를 OpenAI prompt의 `RAG search context`에 넣는다.
6. 포트폴리오 글 또는 면접 예상 질문을 생성한다.

## 비용 안전 기준

- RAG indexing은 OpenAI embedding API를 호출하므로 비용이 발생한다.
- 자동 QA에서는 실제 embedding 호출을 실행하지 않았다.
- 실제 호출 QA는 사용자가 명시적으로 허락한 뒤 진행한다.

## 검증 결과

```txt
backend compileall app: success
frontend npm run build: success
FastAPI app import: success
registered route: /ai/rag/index
registered route: /ai/rag/search
```

## 2026-06-17 예외 처리 보강

- RAG 자료가 하나도 없는 프로젝트는 OpenAI embedding 호출 없이 `indexed_count=0` 또는 빈 검색 결과를 반환하도록 보강했다.
- `embed_texts([])`는 `[]`를 반환한다.
- `/ai/generate`의 RAG mode에서 embedding 오류가 발생하면 FastAPI 500으로 새지 않고 AI generation error로 변환된다.

검증:

```txt
backend compileall app: success
frontend npm run build: success
from app.main import app: success
embed_texts([]): []
```
