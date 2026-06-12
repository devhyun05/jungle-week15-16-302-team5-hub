# 말랑 연구소

말랑 연구소는 슬라임 레시피와 실패 사례를 공유하는 커뮤니티입니다. 사용자는 게시글과 댓글로 제작 경험을 남기고, Agent 화면에서 내부 게시글 검색(RAG)과 슬라임 재료 구매처 검색(MCP)을 함께 확인할 수 있습니다.

## 프로젝트 목표

- 회원가입/로그인 기반 게시판을 구현합니다.
- 사용자는 레시피, 실패 해결 질문, 완성 후기를 게시글로 작성합니다.
- 게시글과 댓글은 RAG 검색을 위한 지식 베이스가 됩니다.
- MCP Server는 슬라임 재료 상품 검색 도구를 제공합니다.
- AI Agent는 사용자 요청을 보고 RAG, MCP, 또는 둘 다 사용하는 경로를 선택해 결과를 정리합니다.

## 사용 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL |
| Vector Search | pgvector |
| AI 기능 | RAG / MCP / AI Agent |
| MCP Server | FastAPI JSON-RPC mock tool |

## 핵심 기능

### 기본 게시판 기능

- 회원가입 / 로그인
- 게시글 CRUD
- 댓글 CRUD
- 태그 목록 / 인기 태그 / 태그 필터
- 키워드 검색
- 페이징
- 게시글 유형 구분: 레시피, 실패 해결, 후기, 일반 글

### AI 기능

- RAG: 게시글, 댓글, 태그를 기반으로 비슷한 제작법이나 실패 사례를 검색합니다.
- MCP: 슬라임 종류와 구매 요청을 바탕으로 필요한 재료, 검색 키워드, 예상 가격, 쇼핑 검색 링크를 반환합니다.
- AI Agent: 사용자 입력을 분석해 `rag`, `mcp`, `rag+mcp` 중 필요한 도구 흐름을 선택하고 한 화면에 정리합니다.

## 프로젝트 구조

```plain text
my_board/
  frontend/              React 사용자 화면
  backend/               FastAPI 게시판 API 및 AI API
  mcp_server/            JSON-RPC 기반 상품 검색 MCP 도구 서버
  db/                    DB 초기화 참고 SQL
  docs/                  DB 설계, 데모 시나리오, 와이어프레임 문서
  README.md              프로젝트 소개
```

자세한 파일별 역할은 `docs/project_structure.md`에 정리합니다.

## 전체 아키텍처

```plain text
[React Frontend]
  ↓ REST API
[FastAPI Backend]
  ├─ PostgreSQL
  ├─ 게시판 / 인증 API
  ├─ RAG 검색 로직
  ├─ AI Agent 라우팅
  └─ MCP Client
       ↓ JSON-RPC
     [MCP Server]
       ↓
     [Product Search Tool]
```

## 데이터베이스 개요

| 테이블 | 역할 |
| --- | --- |
| `users` | 회원 정보 |
| `posts` | 레시피, 실패 해결, 후기, 일반 게시글 |
| `comments` | 게시글 댓글 |
| `tags` | 슬라임 종류, 증상, 질감, 난이도, 목적 태그 |
| `post_tags` | 게시글과 태그의 다대다 관계 |
| `embeddings` | RAG 검색용 게시글/댓글 임베딩 |

MCP 결과와 Agent 답변은 재조회 화면이 없으므로 DB에 저장하지 않고 API 응답으로만 반환합니다.

## 데모 시나리오

사용자가 Agent 화면에 다음 요청을 입력합니다.

```plain text
딸기향 투명 슬라임 만드는 법이랑 액티베이터 구매처 알려줘
```

시스템은 다음 순서로 동작합니다.

1. Agent가 요청을 분석해 `rag+mcp` 경로를 선택합니다.
2. RAG가 내부 게시글에서 투명 슬라임 제작법과 실패 해결 사례를 찾습니다.
3. MCP 상품 검색 도구가 필요한 재료와 쇼핑 검색 링크를 반환합니다.
4. Agent가 제작 순서, 참고 게시글, 구매 후보를 한 화면에 정리합니다.
5. 추천 태그를 함께 반환합니다.

예상 결과:

- RAG 근거: 투명 슬라임 제작 순서, 액티베이터 비율, 끈적임 해결 사례
- MCP 재료: 클리어 PVA 글루, 슬라임 액티베이터, 딸기향 향료, 글리터
- 구매 정보: 재료별 검색 키워드, 예상 가격대, 네이버 쇼핑 검색 링크
- 추천 태그: `AI도움`, `클리어슬라임`, `재료구매`, `상품검색`

## 현재 구현 범위

- FastAPI 인증/게시판/댓글/태그 API
- React 홈, 게시글 목록, 상세, 작성/수정, 로그인, 회원가입, Agent 화면
- MCP 상품 검색 mock tool
- Agent route API와 프론트 fallback demo 결과
- 축소 DB 설계 문서와 ERD 이미지

## 한계점

- MCP 상품 검색은 현재 mock 응답이며 실제 쇼핑 API 연동은 추후 확장 대상입니다.
- RAG 검색은 데모 단계에서 텍스트 검색/fallback 결과를 포함할 수 있습니다.
- Agent 답변은 참고용이며 실제 구매 가격이나 재고를 보장하지 않습니다.
- 이미지/영상 기반 질감 분석은 구현 범위에 포함하지 않습니다.

## 개선 아이디어

- 실제 쇼핑 API 연동
- pgvector 기반 유사도 검색 고도화
- 사용자 성공 여부 피드백을 반영한 답변 개선
- 개인 레시피북
