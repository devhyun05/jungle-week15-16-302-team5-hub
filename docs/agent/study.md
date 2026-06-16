# JungleLog 학습 정리

이 문서는 구현한 코드를 이해하기 위해 알아야 하는 개념을 정리한다. 구현이 끝날 때마다 “수정한 파일”, “코드 흐름”, “핵심 개념”, “다음에 공부할 것”을 남긴다.

## 1단계: React mock UI

### 이해할 파일

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/routes.tsx` | URL path와 page component 연결 |
| `frontend/src/app/layouts/MainLayout.tsx` | 공통 레이아웃, 사이드바, 헤더 |
| `frontend/src/app/components/RoleGate.tsx` | 역할 기반 접근 제한 |
| `frontend/src/app/data/mockData.ts` | mock posts, projects, reviews, notifications |
| `frontend/src/app/pages/posts/*` | 게시글 목록/상세/작성/수정 화면 |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | 포트폴리오 관리 화면 |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | AI 도우미 화면 |
| `frontend/src/app/pages/coach/CoachReview.tsx` | 학생/코치 리뷰 화면 |

### React 개념

- Component: 화면 조각을 함수로 나눈다.
- Props: 부모가 자식에게 값을 전달한다.
- State: 화면에서 바뀌는 값을 저장한다.
- Controlled input: input value를 state로 관리한다.
- Conditional rendering: 조건에 따라 다른 UI를 보여준다.
- React Router: URL에 맞는 page component를 렌더링한다.
- `useParams`: `/posts/:id` 같은 path parameter를 읽는다.
- `useSearchParams`: `/posts?category=learning-log` 같은 query string을 읽는다.
- `useNavigate`: 코드에서 다른 URL로 이동한다.
- `useMemo`: 검색/필터 결과처럼 계산 비용이 있는 값을 dependency가 바뀔 때만 다시 계산한다.

### 핵심 흐름

```txt
사용자가 /posts/3 접속
-> routes.tsx가 PostDetail을 렌더링
-> PostDetail이 useParams로 id=3을 읽음
-> mock posts 또는 API에서 id=3 게시글을 찾음
-> 찾으면 상세 표시, 없으면 404 안내 표시
```

## 2단계: UI 안정화와 mock 동작

### 학습 포인트

- mock UI는 서버 없이도 흐름을 이해하기 위한 단계다.
- useState로 작성/수정/삭제/댓글/리뷰 요청이 동작하는 것처럼 만들 수 있다.
- 하지만 실제 저장, 권한, 검색, 리뷰 요청은 백엔드 API가 필요하다.

### role 기반 UI

```txt
current user role
-> STUDENT면 학생 메뉴
-> COACH면 코치 메뉴
-> ADMIN이면 관리자 메뉴
-> RoleGate에서 접근 가능 역할 확인
```

### Link와 NavLink

- `Link`: 단순 이동에 사용한다.
- `NavLink`: 현재 URL과 일치할 때 active 스타일을 주기 좋다.

## 3단계: 백엔드 기본 구조

### 이해할 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/main.py` | FastAPI app 생성, middleware, router 등록 |
| `backend/app/core/config.py` | 환경변수 설정 관리 |
| `backend/app/db/session.py` | SQLAlchemy engine/session 생성 |
| `backend/app/db/base.py` | SQLAlchemy Base 선언 |
| `backend/app/db/init_db.py` | 테이블 생성, 기본 카테고리 seed |
| `backend/app/routers/health.py` | health check API |

### FastAPI 기본 흐름

```txt
브라우저/Swagger가 HTTP 요청
-> FastAPI router endpoint 실행
-> dependency가 DB session/current user 주입
-> service 호출
-> repository가 DB 조회/저장
-> schema 형태로 JSON 응답
```

### SQLAlchemy session

- `engine`: DB 연결을 관리하는 핵심 객체
- `SessionLocal`: 요청마다 DB 작업 단위를 만들기 위한 factory
- `get_db`: FastAPI dependency로 session을 열고, 요청이 끝나면 닫는다.

## 4단계: DB 설계와 SQLAlchemy 모델

### 핵심 테이블

| 테이블 | 역할 |
| --- | --- |
| users | Google OAuth 사용자, role/approval 관리 |
| posts | 학습 로그, 트러블슈팅, 회고, 면접 질문, 포트폴리오 게시글 |
| post_categories | 게시글 카테고리 기준 데이터 |
| comments | 게시글 댓글 |
| tags | 태그 목록 |
| post_tags | 게시글과 태그 N:M 연결 |
| portfolio_projects | GitHub 기반 포트폴리오 프로젝트 |
| portfolio_project_posts | 프로젝트와 학습 기록 N:M 연결 |
| review_requests | 코치 리뷰 요청 |
| review_request_coaches | 리뷰 요청과 코치 N:M 연결 |
| notifications | 사용자 알림 |
| user_approval_logs | 관리자 승인/역할 변경 이력 |
| auth_refresh_tokens | refresh token hash 저장 |
| github_commits | 프로젝트별 GitHub commit message 저장 |

### PK/FK 이해

- `users.id`: 사용자 PK
- `posts.author_id`: 어떤 사용자가 쓴 글인지 가리키는 FK
- `comments.post_id`: 어떤 게시글의 댓글인지 가리키는 FK
- `portfolio_projects.owner_id`: 프로젝트 소유자 FK

## 5단계: 게시글/댓글 API

### 수정한 주요 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/routers/posts.py` | 게시글 HTTP endpoint |
| `backend/app/services/post_service.py` | 게시글 비즈니스 규칙 |
| `backend/app/repositories/post_repository.py` | 게시글 DB query |
| `backend/app/schemas/post.py` | 게시글 request/response 타입 |
| `frontend/src/app/api/posts.ts` | 프론트 게시글 API client |
| `frontend/src/app/pages/posts/PostDetail.tsx` | 상세/댓글/삭제 UI |

### 코드 흐름

```txt
POST /posts
-> router가 request body와 current_user를 받음
-> service가 제목/본문 검증, 카테고리 확인
-> repository가 posts/tags/post_tags 저장
-> service가 response schema로 변환
-> router가 201 반환
```

### 배운 개념

- router/service/repository 분리
- Pydantic request/response schema
- 400/404/422 차이
- soft delete
- transaction

## 6단계: Google OAuth / JWT 인증

### 수정한 주요 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/core/security.py` | JWT 생성/검증, token hash |
| `backend/app/routers/auth.py` | Google OAuth, me, refresh, logout endpoint |
| `backend/app/services/auth_service.py` | 로그인/토큰 발급 흐름 |
| `backend/app/repositories/user_repository.py` | 사용자 조회/생성/갱신 |
| `backend/app/repositories/auth_token_repository.py` | refresh token 저장/폐기 |
| `frontend/src/app/contexts/AuthContext.tsx` | 프론트 현재 사용자 상태 관리 |
| `frontend/src/app/api/auth.ts` | 인증 API client |

### 인증 흐름

```txt
Google로 계속하기 클릭
-> /auth/google/login
-> Google 로그인
-> /auth/google/callback?code=...
-> 백엔드가 Google userinfo 조회
-> users row 생성/연결
-> access/refresh cookie 설정
-> 프론트 /auth/me로 현재 사용자 확인
```

### 중요한 결정

- Google은 “이 사람이 누구인지” 확인한다.
- JungleLog의 권한은 DB의 `role`, `approvalStatus`가 결정한다.
- refresh token 원문은 DB에 저장하지 않고 hash만 저장한다.
- `ADMIN_EMAILS` 최고관리자는 실수로 role/status가 바뀌면 안 된다.

## 7단계: 관리자 승인

### 학습 포인트

- RBAC: Role-Based Access Control
- Audit log: 누가 누구의 권한을 바꿨는지 기록
- 최고관리자 보호: 프론트에서 막고 백엔드에서도 막아야 한다.

### 흐름

```txt
ADMIN이 /admin/users 접속
-> GET /admin/users
-> 승인 대기/완료 사용자 조회
-> role/status 선택
-> PATCH /admin/users/{id}
-> user_approval_logs에 이력 저장
```

## 8단계: 포트폴리오 프로젝트

### 수정한 주요 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/routers/portfolio.py` | 포트폴리오 API endpoint |
| `backend/app/services/portfolio_service.py` | 프로젝트 등록/수정/발행 비즈니스 로직 |
| `backend/app/repositories/portfolio_repository.py` | 프로젝트 DB query |
| `backend/app/services/github_service.py` | GitHub REST API 호출 |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | 포트폴리오 관리 UI |
| `frontend/src/app/api/portfolio.ts` | 프론트 API client와 응답 정규화 |

### GitHub 프로젝트 등록 흐름

```txt
GitHub repo URL 입력
-> 백엔드가 owner/repo/branch 파싱
-> GitHub API로 repo/readme/languages/commits 조회
-> portfolio_projects 저장
-> github_commits 저장
-> 화면에 프로젝트 카드 표시
```

### 포트폴리오 게시글 발행 흐름

```txt
포트폴리오 게시글로 발행 클릭
-> 공개/비공개 선택 modal
-> POST /portfolio/projects/{id}/publish-post
-> 처음이면 posts 생성
-> 이미 있으면 posts 갱신
-> 같으면 unchanged
-> publishedPostId로 게시글 보기 연결
```

### API 응답 정규화

- TypeScript build가 성공해도 runtime error는 날 수 있다.
- API 응답에 배열 필드가 없으면 `undefined.map` 오류가 날 수 있다.
- 그래서 `frontend/src/app/api/portfolio.ts`에서 `githubCommits ?? []` 같은 기본값을 넣는다.

## 9단계: 코치 리뷰

### 학습 포인트

- 학생과 코치는 같은 리뷰 요청 데이터를 다른 관점에서 본다.
- 학생: 내가 보낸 요청 목록
- 코치: 나에게 들어온 인박스
- 피드백은 댓글과 다르다. 댓글은 원문 게시글 대화이고, 코치 피드백은 리뷰 요청에 대한 공식 피드백이다.

### 흐름

```txt
STUDENT가 리뷰 요청 생성
-> review_requests 저장
-> review_request_coaches 연결
-> COACH가 inbox에서 요청 조회
-> COACH가 상태와 feedback 전송
-> STUDENT가 요청 현황에서 상태/피드백 확인
```

## 10단계: GitHub 참고 자료와 AI 준비

### 이번에 준비한 데이터

- README 원문 전체: `portfolio_projects.readme_content`
- 커밋 메시지 전체: `github_commits`
- 연결된 학습 기록: `portfolio_project_posts`
- 저장된 포트폴리오 글: `saved_portfolio_draft`
- 저장된 면접 질문: `saved_interview_questions`

### 화면과 AI 입력의 차이

- 화면: 요약과 최근 일부만 보여준다.
- AI/RAG: README 원문 전체와 수집된 전체 커밋 메시지를 참고한다.

이렇게 해야 화면은 깔끔하고, AI는 충분한 근거를 갖는다.

### commit diff를 제외한 이유

- 데이터 양이 너무 커진다.
- lock file, 자동 포맷팅, 빌드 산출물이 섞이면 AI 품질이 떨어질 수 있다.
- v1 포트폴리오/면접 질문에는 commit message만으로도 개발 흐름을 어느 정도 파악할 수 있다.

## 다음에 공부할 키워드

Frontend:

- React component
- props/state
- controlled input
- React Router
- useParams/useSearchParams/useNavigate
- Context API
- API client 분리
- optimistic update와 refetch

Backend:

- FastAPI router/dependency
- Pydantic schema
- SQLAlchemy relationship
- transaction
- JWT/OAuth2
- HttpOnly cookie
- RBAC
- PostgreSQL join/index

AI:

- RAG document chunking
- embedding
- pgvector
- OpenAI API
- function calling
- MCP server
- Agent loop

## 2026-06-16 학습 기록: 포트폴리오 UI 구조 정리

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`: 포트폴리오 관리 화면의 상태 필터와 GitHub 참고 정보 렌더링을 담당한다.

### 이번 구현에서 볼 React 개념

- `useState`: `coachStatusFilter`에 현재 선택된 코치 리뷰 상태를 저장한다.
- `useMemo`: 검색어와 코치 리뷰 상태가 바뀔 때 `filteredProjects`를 다시 계산한다.
- 조건부 className: 선택된 필터와 선택되지 않은 필터의 스타일을 다르게 보여준다.
- 배열 `map`: 필터 항목, 기술 스택, 최근 커밋 목록을 반복 렌더링한다.
- `details` / `summary`: README 참고 자료를 접힘/펼침 UI로 보여준다.

### 이해 포인트

- segmented control은 여러 선택지 중 하나만 고르는 UI다. 기능은 기존 버튼과 같지만, 하나의 묶음처럼 보여서 화면이 덜 어수선하다.
- GitHub 참고 정보는 AI/RAG의 재료이지만 사용자가 매번 자세히 읽는 핵심 산출물은 아니다. 그래서 포트폴리오 글보다 작은 오른쪽 보조 영역에 정리한다.
- 이번 작업은 API 응답 구조를 바꾸지 않고 렌더링만 바꿨기 때문에 기존 포트폴리오 프로젝트/코치 리뷰/GitHub 데이터 흐름은 유지된다.

## 2026-06-16 학습 기록: select 필터와 3단 grid

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`: 포트폴리오 관리 화면의 필터와 선택 프로젝트 상세 레이아웃을 담당한다.

### 이번 구현에서 볼 개념

- `select` controlled component: `value={coachStatusFilter}`와 `onChange`로 현재 필터 상태를 React state에 저장한다.
- 표시명 변환 함수: `getCoachFeedbackStatusLabel()`은 DB/API 값은 유지하면서 화면에 보이는 말만 바꾼다.
- CSS grid column: `xl:grid-cols-[...]`로 큰 화면에서 포트폴리오 글 / 보조 정보 / GitHub 참고 정보를 3단으로 배치한다.
- 관심사 분리: GitHub 참고 정보는 AI/RAG 참고자료이고, 면접 질문/코치 리뷰/연결 기록은 프로젝트 관리 보조 정보라 column을 분리했다.

### 이해 포인트

- 데이터 값을 직접 바꾸면 필터 비교나 백엔드 저장 값이 꼬일 수 있다. 그래서 `요청함` 값은 그대로 두고 UI label만 `요청 대기 중`으로 바꿨다.
- 드롭다운은 항목이 많을 때 화면을 덜 어수선하게 만들고, 클릭하면 아래로 목록이 펼쳐지는 선택 UI다.
- GitHub README와 커밋 메시지는 AI가 참고하는 자료라 별도 오른쪽 column에 배치하는 편이 포트폴리오 글을 읽는 흐름을 방해하지 않는다.

## 2026-06-16 학습 기록: 카드 내부 계층 정리

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`: 포트폴리오 상세 가운데 column의 보조 정보 UI를 담당한다.

### 이번 구현에서 볼 개념

- spacing scale: `space-y-5`, `p-5`, `mb-4`처럼 반복 간격을 맞춰 같은 영역처럼 보이게 한다.
- content hierarchy: 제목/액션 버튼과 본문을 별도 박스로 나누면 사용자가 섹션 구조를 더 쉽게 읽는다.
- nested link card: 연결된 학습 기록 전체가 하나의 Link이며, 안쪽에 metadata/title/summary를 계층적으로 배치한다.
- line clamp: 긴 제목과 요약은 `line-clamp`로 고정해 카드 높이가 지나치게 늘어나는 것을 막는다.

### 이해 포인트

- UI가 어색한 이유가 기능 문제가 아니라 정보 계층 문제일 때가 많다.
- 같은 column 안의 카드들은 padding, header margin, body box 스타일을 통일해야 정돈되어 보인다.

## 2026-06-16 학습 기록: header 줄바꿈 제어

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`

### 이번 구현에서 볼 개념

- `whitespace-nowrap`: 짧은 제목이 단어 중간에서 줄바꿈되지 않도록 막는다.
- header/body 분리: 제목과 액션 버튼을 같은 줄에 넣으면 좁은 column에서 깨지기 쉬워, `space-y` 구조로 위아래를 나눴다.
- grid minmax: `minmax(320px, 0.6fr)`처럼 최소 폭을 지정하면 특정 column이 너무 좁아지는 것을 막을 수 있다.

### 이해 포인트

- 반응형 UI에서 텍스트가 이상하게 줄바꿈되면, 글자 크기보다 레이아웃 압박이 원인인 경우가 많다.
- 제목과 버튼은 같은 줄에 두면 예쁘지만, 좁은 column에서는 분리하는 편이 안정적이다.

## 2026-06-16 학습 기록: 버튼 렌더링 순서

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`

### 이해 포인트

- flex-wrap 영역에서는 JSX에 적힌 버튼 순서대로 줄바꿈이 결정된다.
- 버튼 기능을 바꾸지 않아도 렌더링 순서를 바꾸면 사용자가 보는 그룹감이 달라진다.

## 2026-06-16 학습 기록: flex 그룹 정렬

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`

### 이해 포인트

- 하나의 `flex-wrap` 안에 모든 버튼을 넣으면 화면 폭에 따라 마지막 버튼만 아래로 떨어질 수 있다.
- 관련 버튼끼리 wrapper로 묶으면 줄바꿈이 생겨도 그룹 단위로 움직이기 때문에 UI가 덜 흩어진다.
- 이번 작업은 버튼 동작을 바꾸지 않고 JSX 구조와 className만 조정했다.

## 2026-06-16 학습 기록: 액션 버튼 줄 구성

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`

### 이해 포인트

- `justify-between`은 남는 공간을 좌우로 벌리기 때문에 좁은 카드 안에서는 버튼 그룹이 흩어져 보일 수 있다.
- 이번에는 `space-y-2`로 줄을 직접 나누고, 각 줄 안에서만 `flex-wrap`을 사용해 원하는 순서를 안정적으로 만들었다.

## 2026-06-16 학습 기록: OpenAI 기본 연결

### 수정한 파일

- `backend/app/core/config.py`: `.env`에서 OpenAI API key, model, max token 설정을 읽는다.
- `backend/app/schemas/ai.py`: AI 요청/응답 JSON 모양을 Pydantic schema로 정의한다.
- `backend/app/services/ai_service.py`: 프로젝트 자료를 prompt로 정리하고 OpenAI Responses API를 호출한다.
- `backend/app/routers/ai.py`: 프론트가 호출할 `/ai/generate` endpoint를 등록한다.
- `backend/app/main.py`: AI router를 FastAPI app에 포함한다.

### 이번 구현에서 사용한 개념

- FastAPI router: `/ai/generate` 같은 API 경로를 만든다.
- Service layer: OpenAI 호출처럼 비즈니스 로직이 들어가는 코드를 router 밖으로 분리한다.
- Pydantic schema: request/response의 데이터 타입을 검증한다.
- 환경변수: API key 같은 비밀값은 코드가 아니라 `.env`에서 읽는다.
- OpenAI Responses API: `client.responses.create()`로 모델 응답을 생성한다.

### 지금 단계가 RAG가 아닌 이유

- 지금은 선택된 프로젝트의 README, 커밋 메시지, 연결된 기록을 그대로 prompt에 넣는다.
- RAG는 많은 데이터 중 관련 있는 자료를 vector search로 찾은 뒤 prompt에 넣는 구조다.
- 따라서 이번 단계는 `OpenAI 단일 호출`, 다음 단계가 `RAG 검색 연결`이다.

### 내가 이해해야 할 흐름

1. 프론트가 프로젝트 id와 생성 유형을 백엔드에 보낸다.
2. 백엔드가 현재 로그인 사용자 권한을 확인한다.
3. 백엔드가 포트폴리오 프로젝트를 조회한다.
4. 백엔드가 README, 커밋, 연결 기록을 prompt로 만든다.
5. 백엔드가 OpenAI API를 호출한다.
6. 생성된 text를 프론트로 반환한다.

## 2026-06-17 학습 기록: AI 도우미 프론트 API 연결

### 수정한 파일

- `frontend/src/app/api/ai.ts`: AI 생성 API 호출 함수를 추가했다.
- `frontend/src/app/pages/ai/AIAssistant.tsx`: `OpenAI로 생성하기` 버튼에서 백엔드 `/ai/generate`를 호출하도록 연결했다.

### 이번 구현에서 사용한 React 개념

- `useState`: `generatedText`, `isGenerating`으로 실제 생성 결과와 로딩 상태를 관리한다.
- 조건부 데이터 선택: `generatedText || fallbackResultText`로 실제 API 결과가 있으면 API 결과를 보여주고, 없으면 기존 mock preview를 보여준다.
- 이벤트 핸들러: 버튼 클릭 시 `generateResult()`를 실행한다.
- 상태 초기화: 프로젝트나 생성 유형을 바꾸면 이전 생성 결과가 섞이지 않도록 `generatedText`를 비운다.

### 이번 구현에서 사용한 TypeScript/API 개념

- API 경계 파일: `frontend/src/app/api/ai.ts`에서 백엔드 요청/응답 타입을 따로 관리한다.
- snake_case와 camelCase 변환: 백엔드는 `project_id`, 프론트는 `projectId`처럼 쓰기 때문에 API 경계에서 변환한다.
- 비용 제어: 화면 진입 시 자동 호출하지 않고 명시적인 버튼 클릭에서만 OpenAI를 호출한다.

### 코드 흐름

1. 사용자가 AI 도우미에서 프로젝트와 결과 유형을 선택한다.
2. `OpenAI로 생성하기` 버튼을 누른다.
3. `generateAIContent({ projectId, outputType })`가 `/ai/generate`를 호출한다.
4. 백엔드가 프로젝트 README, 커밋 메시지, 연결 기록을 prompt로 구성해 OpenAI를 호출한다.
5. 프론트는 응답의 `content`를 `generatedText`에 저장한다.
6. 저장 버튼을 누르면 기존 포트폴리오 프로젝트 저장 API로 저장한다.

### 아직 확인할 것

- `backend/.env`의 `OPENAI_API_KEY` 값이 비어 있으면 실제 생성은 실패한다.
- 키를 넣은 뒤 AI 도우미 화면에서 실제 포트폴리오 글/면접 질문 생성 결과를 확인해야 한다.

## 2026-06-17 학습 기록: AI API 실제 호출 QA

### 오늘 확인한 흐름

1. `.env`에 `OPENAI_API_KEY` 값이 들어갔는지 확인했다.
2. `/ai/generate`가 처음에는 404로 나왔다.
3. 이유는 백엔드 서버가 AI 라우터 추가 전 코드로 계속 떠 있었기 때문이다.
4. 서버를 재시작하니 OpenAPI 문서에 `/ai/generate`가 등록됐다.
5. 테스트용 JWT cookie를 만들어 실제 HTTP endpoint를 호출했다.
6. FastAPI router, role dependency, service layer, OpenAI API 호출까지 통과했다.

### 여기서 이해해야 할 백엔드 개념

- 서버 재시작: 코드 파일을 수정해도 실행 중인 프로세스가 새 코드를 반영하지 못하면 API가 없다고 나올 수 있다.
- OpenAPI 문서: FastAPI가 현재 등록된 router를 바탕으로 `/docs`와 `/openapi.json`을 만든다.
- JWT cookie: 프론트가 직접 token을 읽지 않아도 브라우저가 cookie를 보내면 백엔드가 `get_current_user`로 사용자 인증을 한다.
- Endpoint QA: service 함수 직접 호출과 HTTP endpoint 호출은 다르다. HTTP endpoint 호출은 router, dependency, schema 검증까지 함께 확인한다.

### 지금 확인된 것과 남은 것

- 확인됨: OpenAI key, service 호출, HTTP endpoint 호출, OpenAI 생성 응답.
- 남음: 프로젝트를 가진 학생 계정으로 브라우저에서 `OpenAI로 생성하기` 버튼을 직접 눌러 저장 흐름까지 확인.

## 2026-06-17 학습 기록: GitHub 참고 자료 UI 정리

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`: 포트폴리오 관리 화면의 GitHub 참고 자료 섹션을 정리했다.
- `frontend/src/app/pages/posts/PostDetail.tsx`: 포트폴리오 게시글 상세에서 전체 커밋 메시지 접힘 영역을 제거했다.
- `frontend/src/app/pages/ai/AIAssistant.tsx`: AI 도우미 참고 자료 설명의 들여쓰기와 문구를 맞췄다.

### 이번 구현에서 이해할 UI 설계 포인트

- 데이터가 있다고 해서 전부 화면에 보여줄 필요는 없다.
- 커밋 메시지 전체는 AI/RAG가 참고할 원천 자료이고, 사용자가 매번 읽어야 하는 핵심 산출물은 아니다.
- 사용자가 원본 전체를 확인하고 싶을 때는 GitHub commits 페이지가 더 적합하다.
- 그래서 서비스 화면에는 최근 커밋 preview와 `GitHub 커밋 보기`만 남기고, 전체 커밋 메시지 모달은 제거했다.

### React 관점에서 볼 부분

- JSX 제거: 불필요한 `details`, modal, state를 제거해 렌더링할 UI를 줄였다.
- 상태 정리: `isCommitDialogOpen`처럼 더 이상 필요 없는 state를 제거했다.
- 들여쓰기 UI: `ml-6`, `space-y-3`을 사용해 제목과 설명/버튼/본문의 시각적 계층을 만들었다.

### AI/RAG 관점에서 볼 부분

- UI에서 전체 커밋을 숨겨도 DB에 저장된 커밋 메시지는 AI context로 사용할 수 있다.
- 사용자가 보는 정보와 AI가 참고하는 정보는 다를 수 있다.
- 화면은 읽기 편하게 요약하고, AI는 더 많은 원천 자료를 참고하도록 나누는 것이 좋다.

## 2026-06-17 학습 기록: AI 생성 결과 저장 흐름 QA

### 이번에 확인한 API 흐름

```txt
학생 계정 JWT cookie
  -> GET /portfolio/projects
  -> POST /ai/generate
  -> PATCH /portfolio/projects/{id}
  -> GET /portfolio/projects
```

### 왜 이 QA를 했나

- 현재 브라우저에는 관리자 계정으로 로그인되어 있다.
- 포트폴리오 프로젝트는 학생 계정 소유라 관리자 화면에서는 AI 도우미 프로젝트 목록이 비어 있다.
- 그래서 먼저 API 수준에서 프론트가 할 일을 그대로 검증했다.

### 이해할 개념

- UI QA와 API QA는 다르다.
- UI QA는 실제 버튼 클릭, 화면 표시, toast, 저장 결과를 확인한다.
- API QA는 프론트가 내부적으로 호출하는 API들이 올바른 순서와 데이터로 동작하는지 확인한다.
- 이번에는 API QA로 `AI 생성 -> 저장 -> 재조회` 흐름이 작동함을 확인했다.

### 다음에 직접 확인할 것

- `leejunhee2796@gmail.com` 학생 계정으로 로그인한다.
- `/ai-assistant`에서 프로젝트가 보이는지 확인한다.
- `OpenAI로 생성하기` 버튼을 누른다.
- 생성 결과가 화면에 표시되는지 확인한다.
- 저장 버튼을 누른 뒤 포트폴리오 관리 화면에서 저장 상태가 바뀌는지 확인한다.

## 2026-06-17 학습 기록: 포트폴리오 게시글 파서 버그

### 버그 현상

- 포트폴리오 관리에서는 AI 생성 포트폴리오 글이 저장된 것처럼 보였다.
- 그런데 포트폴리오 게시글로 발행한 뒤 상세 화면에서는 `아직 작성된 포트폴리오 글이 없습니다.`가 보였다.

### 실제 원인

- DB에는 포트폴리오 글이 정상 저장되어 있었다.
- 발행 게시글 본문에도 `## 포트폴리오 글` 아래 실제 AI 생성 글이 들어 있었다.
- 문제는 프론트 파서였다.
- AI 생성 글 안에는 `# JungleLog 프로젝트 경험`, `## 프로젝트 개요` 같은 Markdown heading이 들어 있다.
- 기존 파서는 본문 전체에서 `#`, `##`를 만나면 계속 새 섹션으로 해석했다.
- 그래서 `## 포트폴리오 글` 아래 내용이 `포트폴리오 글` 섹션에 남지 않고 다른 섹션으로 흩어졌다.

### 수정한 방식

- `parsePortfolioPostContent`에서 현재 섹션이 `포트폴리오 글`이면 이후 줄은 전부 포트폴리오 본문으로 취급한다.
- 즉, `포트폴리오 글` 안의 `#`, `##`, `###`는 새 섹션이 아니라 글 내용이다.

### 배운 점

- Markdown 문자열을 섹션별로 파싱할 때는 상위 문서의 heading과 내부 콘텐츠의 heading을 구분해야 한다.
- AI 생성 결과는 사람이 쓰는 글처럼 Markdown heading을 포함할 수 있으므로, 단순히 `line.startsWith("## ")`만 보면 위험하다.
- 저장 데이터가 맞는데 화면이 이상하면 DB, API 응답, 프론트 파서 순서로 나눠 확인하면 원인을 빨리 찾을 수 있다.

### UI 개선

- 포트폴리오 관리 화면에서 긴 포트폴리오 글을 전부 펼치지 않고 12줄 preview로 보여준다.
- `전체 포트폴리오 글 보기` 버튼을 누르면 modal에서 전체 글을 볼 수 있다.

## 2026-06-17 학습 기록: 포트폴리오 Markdown 렌더링

### 수정한 파일

- `frontend/src/app/components/portfolio/PortfolioMarkdownBlock.tsx`: 포트폴리오 글 전용 Markdown 렌더러.
- `frontend/src/app/pages/posts/PostDetail.tsx`: 포트폴리오 게시글 상세에서 전용 렌더러 사용.
- `frontend/src/app/pages/portfolio/Portfolio.tsx`: 전체 포트폴리오 글 보기 모달에서 같은 렌더러 사용.

### 왜 필요한가

- AI가 생성한 포트폴리오 글은 Markdown 구조를 가진다.
- `#`, `##`, `-`, `---`를 단순히 제거하면 구조가 사라져 긴 텍스트 덩어리처럼 보인다.
- 포트폴리오 글은 섹션과 목록이 중요한 산출물이므로, Markdown의 의미를 UI로 살려야 한다.

### 구현 방식

- 외부 라이브러리 없이 필요한 문법만 직접 파싱했다.
- `#`는 큰 제목, `##`는 섹션 제목, `###`는 소제목으로 바꾼다.
- `-` 또는 `*`로 시작하는 줄은 목록으로 묶어 렌더링한다.
- `---`는 얇은 구분선으로 렌더링한다.
- 일반 문장은 paragraph로 렌더링한다.

### React/TypeScript 개념

- union type: `MarkdownBlock` 타입으로 heading, paragraph, list, divider를 구분한다.
- parser function: 문자열을 line 단위로 읽어 화면에 필요한 구조로 변환한다.
- component reuse: 게시글 상세와 포트폴리오 관리 모달이 같은 렌더러를 사용한다.

### 나중에 개선할 수 있는 것

- 표, 링크, 코드블록, 굵은 글씨 등 Markdown 문법이 더 필요해지면 `react-markdown` 같은 라이브러리를 검토할 수 있다.
- 지금은 과제 범위에 맞춰 포트폴리오 글에 필요한 최소 문법만 직접 처리한다.

### 추가로 배운 점

- AI가 항상 `# 큰 제목`으로 시작한다고 가정하면 안 된다.
- 어떤 응답은 `### 제목`처럼 낮은 heading으로 시작하고, 어떤 응답은 Markdown heading 없이 제목 문장으로 바로 시작할 수 있다.
- 그래서 렌더러에서 첫 heading이 `##`나 `###`이어도 문서 첫 제목이면 대표 제목으로 승격했다.
- 첫 block이 문단이고 첫 줄이 짧은 제목처럼 보이면 그 첫 줄도 대표 제목으로 분리한다.
- 관리 화면 미리보기와 상세 화면이 서로 다르게 보이지 않도록 같은 렌더러를 재사용했다.

## 2026-06-17 학습 기록: 포트폴리오 상세 정보 구조

### 수정한 파일

- `frontend/src/app/components/portfolio/PortfolioMarkdownBlock.tsx`: Markdown heading 범위와 numbered list 처리 확장.
- `frontend/src/app/pages/portfolio/Portfolio.tsx`: 면접 예상 질문/코치 피드백 preview와 전체보기 모달 추가.
- `frontend/src/app/pages/posts/PostDetail.tsx`: 포트폴리오 게시글 상세를 넓은 문서형 레이아웃으로 재배치.
- `backend/app/services/portfolio_service.py`: 포트폴리오 게시글 발행 본문에 면접 예상 질문 섹션 추가.

### 왜 필요한가

- AI 응답은 항상 같은 Markdown 형식으로 오지 않는다.
- 어떤 모델 응답은 `####`처럼 낮은 heading을 사용하고, 어떤 응답은 numbered list를 섞는다.
- 포트폴리오 글은 게시판의 일반 본문보다 산출물 성격이 강하므로, 프로젝트 개요/본문/참고자료의 시각적 우선순위가 중요하다.

### 핵심 흐름

1. AI 도우미가 포트폴리오 글 또는 면접 예상 질문을 생성한다.
2. 결과는 `portfolio_projects.saved_portfolio_draft`, `saved_interview_questions`에 저장된다.
3. 포트폴리오 관리 화면은 저장된 값을 짧은 preview로 보여주고, 전체보기 모달에서 전체 내용을 보여준다.
4. 포트폴리오 게시글 발행 시 백엔드가 프로젝트 정보, 연결 기록, 커밋 요약, 면접 예상 질문, 포트폴리오 글을 하나의 게시글 본문으로 만든다.
5. 게시글 상세 화면은 그 본문을 다시 섹션별로 나누고, 포트폴리오 글과 면접 질문은 raw Markdown을 유지해 전용 렌더러로 보여준다.

### 배운 점

- 저장 데이터는 Markdown 문자열이어도, 화면에서는 parser와 component로 문서형 UI를 만들 수 있다.
- parser가 데이터를 너무 일찍 `cleanMarkdownText`로 지우면 나중 렌더러가 구조를 살릴 수 없다.
- 그래서 포트폴리오 글/면접 질문처럼 내부 Markdown 의미가 중요한 섹션은 raw text를 유지해야 한다.
- 게시글 상세처럼 사용자에게 결과물이 보이는 화면은 `max-width`와 보조 column 배치가 가독성에 큰 영향을 준다.

## 2026-06-17 학습 기록: AI 도우미 결과 상태와 fallback

### 수정한 파일

- `frontend/src/app/pages/ai/AIAssistant.tsx`: 결과 영역이 sample fallback 대신 저장값/생성값만 보여주도록 수정.
- `frontend/src/app/utils/interviewQuestions.ts`: 면접 질문 표시 전용 정리 함수 추가.
- `frontend/src/app/pages/portfolio/Portfolio.tsx`: 면접 질문/코치 피드백 전체보기 흐름 정리.
- `frontend/src/app/pages/posts/PostDetail.tsx`: 게시글 상세의 면접 질문을 modal로 분리.
- `backend/app/services/ai_service.py`: 면접 질문 생성 prompt에서 꼬리 질문 요구 제거.

### 왜 필요한가

- mock UI 단계에서는 sample text가 화면 이해를 도와줬다.
- 하지만 실제 OpenAI/API 연결 이후에는 sample text가 실제 저장 결과처럼 보이면 사용자가 혼란스럽다.
- 따라서 AI 도우미 결과 영역은 다음 세 상태를 구분해야 한다.
  - 아직 생성/저장된 결과 없음
  - 기존 저장 결과 있음
  - 이번에 새로 생성한 결과 있음

### 핵심 흐름

1. `generatedText`가 있으면 방금 OpenAI로 생성한 결과를 보여준다.
2. `generatedText`가 없고 프로젝트에 저장된 결과가 있으면 저장된 결과를 보여준다.
3. 둘 다 없으면 sample을 만들지 않고 빈 상태 안내를 보여준다.
4. 저장 버튼은 실제 저장할 본문이 있을 때만 활성화된다.

### 배운 점

- fallback text는 개발 초기에는 편하지만, 실제 데이터 연결 이후에는 실제 데이터와 구분하기 어렵다.
- AI 생성 기능에서는 “예시”, “저장된 결과”, “방금 생성한 결과”를 UI와 state에서 명확히 분리해야 한다.
- 긴 부가 자료는 본문에 바로 펼치기보다 modal이나 details로 숨겨야 핵심 글의 가독성을 지킬 수 있다.

## 2026-06-17 학습 기록: 포트폴리오 프로젝트 삭제 흐름

### 수정한 파일

- `backend/app/repositories/portfolio_repository.py`: 프로젝트 삭제 시 관련 테이블을 정리하는 repository 함수 추가.
- `backend/app/services/portfolio_service.py`: 현재 사용자가 접근 가능한 프로젝트인지 확인한 뒤 삭제하는 service 함수 추가.
- `backend/app/routers/portfolio.py`: `DELETE /portfolio/projects/{project_id}` API 추가.
- `frontend/src/app/api/portfolio.ts`: 삭제 API 호출 함수 추가.
- `frontend/src/app/pages/portfolio/Portfolio.tsx`: 삭제 버튼, 확인 modal, 삭제 후 목록 갱신 로직 추가.

### 왜 필요한가

- 등록 기능이 있으면 잘못 등록한 데이터를 되돌릴 수 있는 삭제/정리 흐름도 필요하다.
- 프로젝트는 단독 데이터가 아니라 연결된 학습 기록, GitHub commit, 코치 리뷰 요청과 관계가 있다.
- 따라서 삭제할 때 어떤 데이터를 같이 지울지 정책을 먼저 정해야 한다.

### 이번 삭제 정책

- 삭제하는 것:
  - 포트폴리오 프로젝트 row
  - 프로젝트와 학습 기록 연결 row
  - 프로젝트에 수집된 GitHub commit row
  - 프로젝트를 대상으로 한 코치 리뷰 요청과 코치 배정 row
- 남기는 것:
  - 이미 발행된 포트폴리오 게시글

### 배운 점

- DB에서 FK 관계가 있는 데이터를 삭제할 때는 삭제 순서가 중요하다.
- 프론트에서만 목록을 없애는 것은 실제 삭제가 아니므로, 백엔드 API와 DB 삭제 정책이 필요하다.
- 위험 작업은 바로 실행하지 말고 확인 modal을 거치는 편이 좋다.

## 2026-06-17 학습 기록: 면접 질문 preview 설계

### 수정한 파일

- `frontend/src/app/utils/interviewQuestions.ts`: 면접 질문 본문에서 질문만 추출하는 preview 함수 추가.
- `frontend/src/app/pages/portfolio/Portfolio.tsx`: 면접 질문 카드 preview를 질문 요약 목록으로 변경.
- `frontend/src/app/pages/posts/PostDetail.tsx`: 포트폴리오 게시글 상세의 면접 질문 버튼 위치 조정.

### 왜 필요한가

- 저장된 면접 질문 전체를 카드 안에 바로 렌더링하면 질문, 답변 포인트, 목록 UI가 한꺼번에 보여 난잡해진다.
- 관리 화면의 preview는 “무슨 질문이 저장되어 있는지” 정도만 보여주고, 전체 내용은 modal에서 읽는 편이 낫다.

### 배운 점

- 같은 데이터라도 preview와 detail은 보여주는 깊이가 달라야 한다.
- preview에서는 핵심만 추출하고, detail/modal에서는 전체 내용을 보여주는 식으로 정보량을 나누면 화면이 훨씬 덜 복잡해진다.

### 추가로 배운 점

- 프로젝트 삭제 같은 위험 동작은 상세 영역의 큰 버튼보다 목록 카드의 작은 `X`와 확인 modal 조합이 더 관리 도구처럼 보일 수 있다.
- 카드 전체가 click 대상일 때 내부 버튼을 누르면 부모 click도 같이 실행될 수 있으므로 `event.stopPropagation()`이 필요하다.
- SQLAlchemy에서 관계가 이미 로드된 ORM 객체를 `db.delete()`로 삭제하면 FK를 null로 바꾸려는 동작이 섞여 실패할 수 있다.
- 이런 경우 연결 데이터를 bulk delete로 정리한 뒤 parent row도 bulk delete로 삭제하면 관계 로딩 상태의 영향을 줄일 수 있다.
- 면접 질문처럼 형식이 정해진 결과물은 범용 Markdown 렌더러보다 전용 컴포넌트가 더 읽기 좋다.
- 한글 label을 정규식으로 파싱할 때 파일/터미널 인코딩이 깨지면 parser가 엉뚱하게 동작할 수 있다.
- 중요한 label matcher는 `\uC9C8\uBB38` 같은 유니코드 escape를 쓰면 소스 인코딩 영향을 덜 받는다.
- preview와 modal이 서로 다른 parser를 쓰면 한쪽은 3개 요약, 한쪽은 전체가 한 카드로 들어가는 식의 불일치가 생긴다.

## 2026-06-17 학습 기록: RAG/MCP/Agent 연결

### RAG

RAG는 AI가 답변을 만들기 전에 관련 자료를 검색해서 prompt에 넣는 구조다.

이번 구현에서는 `rag_documents` 테이블에 README, commit message, 연결 게시글을 chunk로 저장하고, OpenAI embedding을 `embedding_json`에 저장하도록 설계했다.

검색은 query embedding과 문서 embedding의 cosine similarity를 계산해서 가까운 chunk를 찾는다.

### MCP

MCP는 LLM/Agent가 외부 시스템을 도구처럼 호출할 수 있게 하는 프로토콜이다.

이번 구현에서는 `/mcp` endpoint가 JSON-RPC 요청을 받고, GitHub 조회와 포트폴리오 프로젝트 조회를 tool로 제공한다.

### Agent

Agent는 목표를 달성하기 위해 도구를 순서대로 실행하는 루프다.

이번 구현의 Agent는 다음 순서로 동작한다.

```txt
get_portfolio_project -> rag_search -> generate_project_content
```

`max_iterations`를 1~5로 제한해서 무한 루프를 막는다.

### 배운 점

- RAG는 검색, MCP는 외부 연결, Agent는 도구 실행 루프다.
- RAG embedding과 AI generation은 비용이 발생하므로 자동 테스트에서 호출하면 안 된다.
- 과제용 v1에서는 완전 자율 Agent보다 흐름이 보이는 제한된 Agent가 학습과 설명에 유리하다.
- 빈 RAG 자료처럼 실제 서비스에서 충분히 생길 수 있는 edge case는 OpenAI 호출 전에 빠르게 return시키는 편이 안전하다.
- 외부 API 호출 오류는 service 내부 예외로 감싸 router가 명확한 HTTP 응답으로 바꿀 수 있어야 한다.

## 2026-06-17 학습 기록: Agent RAG context 재사용

### 수정한 파일

- `backend/app/services/agent_service.py`
  - Agent가 RAG 검색 결과를 prompt context 문자열로 바꾸는 `format_rag_context`를 추가했다.
- `backend/app/services/ai_service.py`
  - 이미 검색된 RAG context를 받을 수 있도록 `rag_context_override` 인자를 추가했다.

### 왜 수정했나

Agent는 tool call log를 보여줘야 하므로 RAG 검색을 명시적으로 한 번 실행한다.

그런데 생성 함수도 `generation_mode="rag"`일 때 내부에서 RAG 검색을 다시 실행하면 같은 실행에서 embedding/search 비용이 중복될 수 있다.

### 수정 후 흐름

```txt
Agent
-> get_portfolio_project
-> rag_search
-> format_rag_context
-> generate_project_content(rag_context_override)
-> OpenAI generation
```

### 핵심 포인트

- 이미 계산한 값은 함수 인자로 넘겨 재사용할 수 있다.
- OpenAI embedding은 비용이 발생하므로 불필요한 중복 호출을 줄여야 한다.
- Agent tool call log와 실제 prompt context가 같아야 “왜 이런 답변이 나왔는지” 설명하기 쉽다.
- 이 구조는 나중에 Agent 실행 로그를 DB에 저장할 때도 사용 근거를 추적하기 좋다.
