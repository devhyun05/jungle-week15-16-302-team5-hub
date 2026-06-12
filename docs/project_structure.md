# 프로젝트 파일 구조

이 문서는 현재 `my_board` 저장소의 폴더와 파일이 어떤 역할을 맡는지 정리한다.

## 루트

```plain text
README.md
.env.example
.gitignore
docs/
frontend/
backend/
mcp_server/
db/
```

- `README.md`: 프로젝트 소개, 기술 스택, 현재 기능, 데모 시나리오를 정리한다.
- `.env.example`: 로컬 실행에 필요한 환경 변수 이름을 기록한다.
- `.gitignore`: GitHub에 올리지 않을 파일을 정의한다.
- `agent.md`: React 학습 진행 방식 메모.
- `quiz.md`: 프론트엔드 키워드 퀴즈 메모.

## frontend

React, TypeScript, Vite, Tailwind CSS로 사용자 화면을 구현한다.

- `src/main.tsx`: React 앱 진입점.
- `src/App.tsx`: 전체 라우팅과 공통 레이아웃을 연결.
- `src/api/`: FastAPI 호출 함수 모음.
- `src/components/`: 여러 화면에서 재사용할 UI 컴포넌트.
- `src/pages/`: 홈, 인증, 게시글, Agent 페이지.
- `src/styles/`: 전역 스타일과 UI class helper.
- `public/`: 정적 에셋.
- `react-hooks-practice/`: React 훅 학습용 연습 파일.

## backend

FastAPI로 게시판 API와 AI 기능을 구현한다.

- `app/main.py`: FastAPI 앱 생성, 라우터 연결, 헬스체크, DB metadata 생성.
- `app/core/config.py`: 환경 변수와 설정 관리.
- `app/db/`: DB 연결, 세션, Base.
- `app/models/`: SQLAlchemy 모델. 현재 핵심 테이블은 `users`, `posts`, `comments`, `tags`, `post_tags`.
- `app/schemas/`: Pydantic 요청/응답 스키마.
- `app/routers/`: Auth, Posts, Comments, Tags, AI endpoint.
- `app/services/`: 인증, 태그, RAG 검색, MCP Client, Agent route 로직.
- `app/seed.py`: 개발용 초기 태그 입력.

## mcp_server

FastAPI 본 서버와 분리된 MCP 도구 서버를 구현한다.

- `app/main.py`: MCP 서버 앱과 `/jsonrpc` endpoint.
- `app/jsonrpc.py`: JSON-RPC 요청/응답 처리.
- `app/tools/product_search.py`: 슬라임 재료 상품 검색 mock tool.

## db

- `init.sql`: PostgreSQL/pgvector 초기화 참고 SQL. 실제 모델 기준 설계는 `docs/db_erd.md`를 우선한다.

## docs

- `db_erd.md`: 축소 DB 설계와 ERD 이미지 설명.
- `db_schema_sql.md`: PostgreSQL 테이블 생성 SQL.
- `demo_scenario.md`: 현재 시연 흐름.
- `wireframe/README.md`: 현재 화면 구성 문서.
- `assets/malrang-erd.png`: DB ERD 이미지.
- `assets/malrang-erd.svg`: DB ERD 이미지 원본.

## 현재 구현 흐름

1. 기본 게시판 기능은 `users`, `posts`, `comments`, `tags`, `post_tags` 중심으로 동작한다.
2. RAG는 게시글/댓글을 검색 대상으로 삼고, 최종 DB 설계에서는 `embeddings`에 벡터를 저장한다.
3. MCP는 상품 검색 도구 결과를 API 응답으로 반환한다.
4. Agent는 사용자 요청을 `rag`, `mcp`, `rag+mcp`로 라우팅하고 결과를 조합한다.
5. MCP와 Agent 결과는 재조회 화면이 없으므로 DB에 저장하지 않는다.
