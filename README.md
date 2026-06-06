# 말랑 연구소

말랑 연구소는 슬라임 레시피와 실패 사례를 공유하는 AI 커뮤니티입니다. 사용자가 슬라임 제작 중 겪은 문제를 게시글로 작성하면, RAG가 기존 실패 사례를 검색하고, MCP가 현재 습도 정보를 가져오며, AI Agent가 실패 원인과 해결 방법을 단계별로 추천합니다.

## 프로젝트 목표

이 프로젝트는 기본 게시판 기능과 AI 응용 기능을 하나의 흐름으로 연결하는 것을 목표로 합니다.

- 사용자는 레시피, 실패 해결 질문, 완성 후기를 게시글로 작성합니다.
- 게시글과 댓글은 RAG 검색을 위한 지식 베이스가 됩니다.
- MCP Server는 외부 날씨/습도 API를 호출합니다.
- 말랑 진단 에이전트는 RAG와 MCP 결과를 조합해 해결 순서를 제안합니다.

## 사용 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | React |
| Backend | FastAPI |
| Database | PostgreSQL |
| Vector DB | pgvector |
| AI 기능 | RAG / MCP / AI Agent |
| LLM | 상용 LLM API |
| 기록 관리 | Notion |
| 코드 관리 | GitHub |

## 핵심 기능

### 기본 게시판 기능

- 회원가입 / 로그인
- 게시글 CRUD
- 댓글
- 태그
- 검색
- 페이징
- 게시글 유형 구분: 레시피 공유, 실패 해결, 완성 후기

### AI 기능

- RAG: 기존 레시피, 실패 사례, 댓글, AI 진단 결과에서 비슷한 실패 사례를 검색합니다.
- MCP: 현재 습도와 온도 정보를 외부 API에서 가져와 슬라임 제작/보관 팁에 반영합니다.
- AI Agent: 사용자 입력을 분석하고 RAG/MCP 도구를 선택해 원인 후보와 해결 순서를 생성합니다.

## 프로젝트 구조

```plain text
my_board/
  frontend/              React 화면 구현
  backend/               FastAPI 게시판 API 및 AI 기능
  mcp_server/            JSON-RPC 기반 MCP 도구 서버
  db/                    PostgreSQL / pgvector 초기화 SQL
  docs/                  설계 문서와 데모 시나리오
  README.md              프로젝트 소개와 실행 가이드
  .env.example           환경 변수 예시
  .gitignore             Git 제외 파일
```

자세한 파일별 역할은 `docs/project_structure.md`에 정리합니다.

## 전체 아키텍처

```plain text
[React Frontend]
  ↓ REST API
[FastAPI Backend]
  ├─ PostgreSQL + pgvector
  ├─ RAG Service
  ├─ AI Agent
  └─ MCP Client
       ↓ JSON-RPC
     [MCP Server]
       ↓
     [Weather / Humidity API]
```

## 데이터베이스 개요

| 테이블 | 역할 |
| --- | --- |
| users | 회원 정보 |
| posts | 레시피, 실패 해결, 완성 후기 게시글 |
| comments | 게시글 댓글 |
| tags | 슬라임 종류, 실패 증상, 질감 태그 |
| post_tags | 게시글과 태그의 다대다 관계 |
| recipes | 레시피 상세 정보 |
| failure_cases | 실패 해결 상세 정보 |
| ai_diagnoses | AI 진단 결과 |
| embeddings | RAG 검색용 임베딩 벡터 |

## 데모 시나리오

사용자가 다음과 같은 실패 글을 작성합니다.

```plain text
클리어 슬라임을 만들었는데 너무 끈적이고 손에 계속 묻어요.
물풀 100ml에 액티베이터를 조금 넣었고, 10분 정도 치댔어요.
```

시스템은 다음 순서로 동작합니다.

1. 게시글을 저장합니다.
2. RAG가 비슷한 실패 사례를 검색합니다.
3. MCP가 현재 습도 정보를 가져옵니다.
4. AI Agent가 원인 후보와 해결 순서를 생성합니다.
5. 자동 태그를 추천합니다.

예상 결과:

- 원인 후보: 액티베이터 부족, 수분 비율 과다, 높은 습도 영향
- 해결 순서: 액티베이터를 2~3방울씩 추가하고, 충분히 치댄 뒤, 밀폐 용기에서 잠시 휴지
- 추천 태그: 클리어슬라임, 끈적임, 액티베이터부족, 실패해결

## 실행 계획

현재 저장소는 실제 구현 전 스캐폴딩 상태입니다. 각 파일에는 앞으로 구현할 기능과 책임이 주석으로 정리되어 있습니다.

1. React 화면 뼈대 구현
2. FastAPI 인증/게시판 API 구현
3. PostgreSQL 테이블 생성
4. RAG embedding 저장 및 유사도 검색 구현
5. MCP Server와 날씨/습도 API 연동
6. 말랑 진단 에이전트 구현
7. README, 데모 스크린샷, 회고 정리

## 한계점

- AI 진단은 참고용이며 실제 제작 결과를 보장하지 않습니다.
- 사용자가 입력한 재료와 비율이 부정확하면 답변 품질이 낮아질 수 있습니다.
- MVP에서는 이미지와 영상 기반 질감 분석을 구현하지 않습니다.
- 외부 날씨 API 실패 시 fallback 안내가 필요합니다.

## 개선 아이디어

- 사진/영상 기반 질감 분석
- 사용자 성공 여부 피드백을 반영한 AI 답변 개선
- 개인 레시피북
- 계절별 슬라임 관리 팁
- 구매 후기 / 판매처 추천 게시판 확장
