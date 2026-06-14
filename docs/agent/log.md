# JungleLog Progress Log

## 2026-06-14 내 기록 화면 API 전환

상태: 완료

목표: `/my-records` 화면을 mock data 필터링에서 백엔드 `GET /me/posts` API 기반으로 전환한다.

구현 파일:

- `backend/app/routers/me.py`
- `backend/app/repositories/post_repository.py`
- `backend/app/services/post_service.py`
- `backend/app/main.py`
- `frontend/src/app/api/posts.ts`
- `frontend/src/app/pages/posts/MyRecords.tsx`
- `README.md`
- `docs/agent/api-design.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/setup.md`
- `docs/agent/back-keyword.md`
- `docs/agent/front-keyword.md`
- `docs/agent/troubleshooting.md`

구현 내용:

- `GET /me/posts` endpoint를 추가했다.
- 현재는 JWT/OAuth2 전이라 demo student를 현재 사용자처럼 사용한다.
- 작성자 id, 카테고리, 검색어, 공개 범위, 페이지 조건으로 게시글을 조회한다.
- `/my-records`의 목록과 통계를 API 응답 기준으로 렌더링한다.
- 카테고리, 공개 범위, 검색어 변경 시 `useEffect`가 다시 API를 호출한다.

검증:

- `backend`: `python -m compileall app` 성공
- `frontend`: `npm run build` 성공
- OpenAPI: `/me/posts` `get` 등록 확인
- HTTP QA: `/me/posts?visibility=all`, `/me/posts?visibility=public`, `/me/posts?category=learning-log` 응답 확인
- HTTP QA: 임시 비공개 글 생성 후 `visibility=private`에 잡히는 것 확인
- Browser QA: `/my-records` 화면에 API 기반 기록 목록 표시, `Unexpected Application Error` 없음

주의:

- 한글 keyword를 PowerShell에서 URI 조합해 검증할 때 기대와 다른 결과가 나올 수 있어, 필터 검증은 영어 keyword와 visibility 조건을 분리해서 확인했다.
- 비공개 글 상세 조회 권한 처리는 JWT/OAuth2 후 별도 API 또는 권한 기반 상세 조회로 보완해야 한다.

커밋 추천 제목:

```txt
feat: 내 기록 화면을 API 기반으로 전환
```

다음 후보 작업:

1. JWT/OAuth2 구현 준비
2. 내 비공개 글 상세 조회 권한 흐름 설계
3. 태그/카테고리 API 분리

## 2026-06-14 댓글 삭제 API와 상세 화면 연결

상태: 완료

목표: 게시글 상세 화면의 댓글 삭제 버튼을 mock 동작이 아니라 실제 백엔드 `DELETE /comments/{comment_id}` API에 연결한다.

구현 파일:

- `backend/app/repositories/comment_repository.py`
- `backend/app/services/comment_service.py`
- `backend/app/routers/comments.py`
- `frontend/src/app/api/comments.ts`
- `frontend/src/app/pages/posts/PostDetail.tsx`
- `README.md`
- `docs/agent/api-design.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/setup.md`
- `docs/agent/back-keyword.md`
- `docs/agent/front-keyword.md`

구현 내용:

- `DELETE /comments/{comment_id}` endpoint를 추가했다.
- 삭제는 hard delete가 아니라 `comments.deleted_at`을 채우는 soft delete로 처리했다.
- 삭제된 댓글은 `GET /posts/{post_id}/comments`에서 보이지 않는다.
- 프론트 상세 화면의 각 댓글에 삭제 버튼을 추가했다.
- 삭제 성공 후 전체 목록을 다시 가져오지 않고 현재 `comments` state에서 해당 댓글만 제거했다.
- 실제 작성자/관리자 권한 검사는 JWT/OAuth2 구현 후 붙일 TODO로 남겼다.

검증:

- `backend`: `python -m compileall app` 성공
- `frontend`: `npm run build` 성공
- HTTP QA: 테스트 게시글 생성 후 댓글 작성 성공
- HTTP QA: `DELETE /comments/{id}`가 `204` 반환
- HTTP QA: 삭제 후 `GET /posts/{post_id}/comments`가 `total=0` 반환
- HTTP QA: 없는 댓글 삭제 시 `404` 반환
- HTTP QA: QA용 테스트 게시글 정리 삭제 `204` 반환

커밋 추천 제목:

```txt
feat: 댓글 삭제 API와 상세 화면 연결
```

다음 후보 작업:

1. 내 기록 화면을 실제 API 기반으로 전환
2. 게시글/댓글 작성자 권한 처리를 위한 JWT/OAuth2 구현 준비
3. 태그/카테고리 API를 분리해 프론트 필터 데이터를 백엔드에서 받도록 전환

## 2026-06-14 게시글 삭제 API와 상세 화면 연결

상태: 완료

목표: 게시글 상세 화면의 삭제 버튼을 mock 안내가 아니라 실제 백엔드 `DELETE /posts/{post_id}` API에 연결한다.

구현 파일:

- `backend/app/repositories/post_repository.py`
- `backend/app/services/post_service.py`
- `backend/app/routers/posts.py`
- `frontend/src/app/api/posts.ts`
- `frontend/src/app/pages/posts/PostDetail.tsx`
- `README.md`
- `docs/agent/api-design.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/setup.md`
- `docs/agent/back-keyword.md`
- `docs/agent/front-keyword.md`
- `docs/agent/troubleshooting.md`

구현 내용:

- `DELETE /posts/{post_id}` endpoint를 추가했다.
- 삭제는 hard delete가 아니라 `posts.deleted_at`을 채우는 soft delete로 처리했다.
- 삭제된 게시글은 목록, 상세, 댓글 조회에서 보이지 않는다.
- 프론트 상세 화면의 삭제 확인 버튼이 `deletePost(id)`를 호출하도록 연결했다.
- 삭제 성공 후 `/posts` 목록으로 이동한다.
- 실제 작성자/관리자 권한 검사는 JWT/OAuth2 구현 후 붙일 TODO로 남겼다.

검증:

- `backend`: `python -m compileall app` 성공
- `frontend`: `npm run build` 성공
- HTTP QA: 테스트 게시글 생성 후 `DELETE /posts/{id}`가 `204` 반환
- HTTP QA: 삭제 후 `GET /posts/{id}`가 `404` 반환
- HTTP QA: 삭제 후 `GET /posts?keyword=테스트제목` 결과가 0건
- HTTP QA: 없는 게시글 삭제 시 `404` 반환
- HTTP QA: 삭제된 게시글의 댓글 조회가 `404` 반환
- Browser QA: `/posts/8` 상세 화면에서 삭제 확인 UI가 열리고, 삭제 확인 후 `/posts`로 이동
- Browser QA: 삭제 후 화면에 `Unexpected Application Error` 없음

주의:

- PowerShell `Invoke-WebRequest`가 `204 No Content` 응답에서 내부 예외를 낸 사례가 있어, 최종 상태 코드는 `curl.exe`로 확인했다.
- 실제 서비스에서는 삭제 권한 검사를 반드시 JWT/OAuth2 이후 추가해야 한다.

커밋 추천 제목:

```txt
feat: 게시글 삭제 API와 상세 화면 연결
```

다음 후보 작업:

1. 댓글 삭제 API 구현 및 상세 화면 댓글 삭제 버튼 연결
2. 내 기록 화면을 실제 API 기반으로 전환
3. 게시글/댓글 권한 검사를 위한 JWT/OAuth2 구현 준비

## 2026-06-14 게시글 수정 API와 수정 화면 연결

상태: 완료

목표: `/posts/:id/edit` 수정 화면이 mock data가 아니라 백엔드 API를 통해 기존 게시글을 불러오고, 수정 완료 시 `PATCH /posts/{post_id}`로 실제 DB를 갱신하게 만든다.

구현 파일:

- `backend/app/schemas/post.py`
- `backend/app/repositories/post_repository.py`
- `backend/app/services/post_service.py`
- `backend/app/routers/posts.py`
- `frontend/src/app/api/posts.ts`
- `frontend/src/app/pages/posts/PostEdit.tsx`
- `README.md`
- `docs/agent/api-design.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/setup.md`
- `docs/agent/back-keyword.md`
- `docs/agent/front-keyword.md`
- `docs/agent/troubleshooting.md`

구현 내용:

- `PATCH /posts/{post_id}` endpoint를 추가했다.
- 수정 request body는 `PostUpdateRequest`로 검증한다.
- 수정할 게시글은 `deleted_at is null` 조건으로 조회하고, 인증 전 단계라 `is_public` 조건은 걸지 않았다.
- posts 테이블의 제목/요약/본문/카테고리/공개 여부/관련 커밋 값을 갱신한다.
- 태그는 N:M 관계라 기존 `post_tags` 연결을 삭제한 뒤 새 태그 목록으로 다시 연결한다.
- `/posts/:id/edit` 화면은 `useParams`의 id로 `GET /posts/{id}`를 호출해 form state를 채운다.
- 수정 완료 버튼은 `updatePost(id, payload)`를 호출하고 성공 시 상세 화면으로 이동한다.

검증:

- `backend`: `python -m compileall app` 성공
- `frontend`: `npm run build` 성공
- HTTP QA: `POST /posts`로 테스트 글 생성 후 `PATCH /posts/{id}` 수정 성공
- HTTP QA: 수정된 글을 `GET /posts/{id}`로 다시 조회했을 때 제목/본문/카테고리 변경 확인
- HTTP QA: 없는 게시글 수정 시 `404` 확인
- HTTP QA: 공백 제목 수정 시 `400` 확인
- Browser QA: `/posts/5/edit`에서 API 값이 제목/본문/카테고리 form에 채워지는 것 확인

주의:

- FastAPI `TestClient`를 쓰려 했지만 현재 가상환경에 `httpx/httpx2` 테스트 의존성이 없어 HTTP QA 방식으로 검증했다.
- 실제 작성자/관리자 권한 검사는 JWT/OAuth2 구현 후 추가한다.

커밋 추천 제목:

```txt
feat: 게시글 수정 API와 수정 화면 연결
```

다음 후보 작업:

1. `DELETE /posts/{post_id}` 게시글 삭제 API 구현 및 상세 화면 삭제 버튼 연결
2. 내 기록 화면을 API 기반으로 전환
3. 게시글 수정/삭제 권한을 JWT 구현 후 현재 사용자 기준으로 보호

## 2026-06-14 게시글 목록/상세 API 전환

상태: 완료

목표: `POST /posts`로 생성된 게시글이 프론트 목록과 상세 화면에서 실제로 보이도록 `GET /posts`, `GET /posts/{post_id}`를 React 화면에 연결한다.

구현 파일:

- `frontend/src/app/api/posts.ts`
- `frontend/src/app/pages/posts/Posts.tsx`
- `frontend/src/app/pages/posts/PostDetail.tsx`
- `frontend/src/app/pages/posts/PostEdit.tsx`
- `README.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/front-keyword.md`

구현 내용:

- `getPosts`, `getPostDetail` 프론트 API 함수를 추가했다.
- 전체 게시글 화면이 mock data 필터링 대신 `GET /posts` 응답을 렌더링하도록 변경했다.
- 카테고리와 검색어를 백엔드 query string으로 전달한다.
- 게시글 상세 화면이 `GET /posts/{post_id}` 응답을 렌더링하도록 변경했다.
- 새 글 발행 성공 후 `/posts/{createdPost.id}` 상세 화면으로 이동하도록 바꿨다.

검증:

- `npm run build` 성공
- `python -m compileall app` 성공
- `GET /posts?size=5`에서 생성된 게시글 id `4` 포함 확인
- `GET /posts/4` 상세 응답 확인
- 브라우저에서 `/posts` 목록에 `post create api test`가 보이는 것 확인
- 브라우저에서 `/posts/4` 상세에 `post create api content`가 보이는 것 확인

커밋 추천 제목:

```txt
feat: 게시글 목록과 상세 화면 API 연결
```

다음 후보 작업:

1. 게시글 수정 API `PATCH /posts/{post_id}` 구현 및 수정 화면 연결
2. 게시글 삭제 API `DELETE /posts/{post_id}` 구현 및 상세 화면 연결
3. 내 기록 화면을 API 기반으로 전환

## 2026-06-14 게시글 작성 API와 글쓰기 화면 연결

상태: 완료

목표: JWT/OAuth2 전 단계에서 `/posts/new`의 발행 버튼을 실제 백엔드 `POST /posts` API에 연결한다.

구현 파일:

- `backend/app/schemas/post.py`
- `backend/app/repositories/post_repository.py`
- `backend/app/services/post_service.py`
- `backend/app/routers/posts.py`
- `frontend/src/app/api/posts.ts`
- `frontend/src/app/pages/posts/PostEdit.tsx`
- `README.md`
- `docs/agent/api-design.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/setup.md`
- `docs/agent/back-keyword.md`

구현 내용:

- `POST /posts` API를 추가했다.
- request body는 `title`, `summary`, `content`, `categorySlug`, `tags`, `isPublic`, `relatedCommit`을 받는다.
- JWT/OAuth2 전 단계라 작성자는 `demo.student@junglelog.local` seed user로 임시 처리했다.
- 태그가 없으면 새로 만들고, 이미 있으면 재사용한 뒤 `post_tags`로 연결한다.
- 프론트 `PostEdit`에서 새 글 발행 시 `createPost` API를 호출하도록 연결했다.
- 수정 모드는 아직 `PATCH /posts/{id}`가 없어 mock 흐름을 유지했다.

검증:

- `backend`: `python -m compileall app` 성공
- `frontend`: `npm run build` 성공
- OpenAPI에서 `/posts`에 `get`, `post` 메서드 등록 확인
- `POST /posts` 성공, 생성된 게시글 id `4` 확인
- `GET /posts?keyword=post%20create%20api%20test`에서 생성된 글 조회 확인
- 없는 카테고리 요청이 `404` 반환 확인
- 공백 제목/본문 요청이 `400` 반환 확인

커밋 추천 제목:

```txt
feat: 게시글 작성 API와 글쓰기 화면 연결
```

다음 후보 작업:

1. 게시글 목록/상세 화면을 mock data에서 API 응답으로 전환
2. 게시글 수정 API `PATCH /posts/{post_id}` 구현
3. 게시글 삭제 API `DELETE /posts/{post_id}` 구현

## 2026-06-13 댓글 작성 API와 프론트 연결

상태: 완료

목표: JWT/OAuth2 전 단계에서 게시글 상세 화면의 댓글 작성 버튼을 실제 백엔드 API와 연결한다.

구현 파일:

- `backend/app/schemas/comment.py`
- `backend/app/repositories/comment_repository.py`
- `backend/app/services/comment_service.py`
- `backend/app/routers/comments.py`
- `frontend/src/app/api/comments.ts`
- `frontend/src/app/pages/posts/PostDetail.tsx`
- `README.md`
- `docs/agent/api-design.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/setup.md`
- `docs/agent/back-keyword.md`
- `docs/agent/troubleshooting.md`

구현 내용:

- `POST /posts/{post_id}/comments` API를 추가했다.
- 댓글 작성 request body는 `content`만 받도록 했다.
- JWT/OAuth2 전 단계라 작성자는 `demo.student@junglelog.local` seed user로 임시 처리했다.
- 공백 댓글은 `400`, 없는 게시글은 `404`, demo user 누락은 `500`으로 구분했다.
- 프론트 `PostDetail`에서 댓글 작성 버튼이 `createPostComment`를 호출하도록 연결했다.
- 댓글 작성 성공 시 전체 목록을 다시 불러오지 않고, 생성된 댓글 응답만 현재 comments state에 추가한다.

검증:

- `backend`: `python -m compileall app` 성공
- `frontend`: `npm run build` 성공
- OpenAPI에서 `/posts/{post_id}/comments`에 `get`, `post` 메서드 등록 확인
- `POST /posts/1/comments` 성공
- `GET /posts/1/comments`에서 작성된 댓글 포함 확인
- `POST /posts/999999/comments`가 `404` 반환 확인
- `git diff --check` 통과. Windows CRLF 변환 경고만 있음

커밋 추천 제목:

```txt
feat: 댓글 작성 API와 게시글 상세 연결
```

다음 후보 작업:

1. 게시글 작성 API `POST /posts` 구현
2. 게시글 수정/삭제 API 구현
3. 프론트 게시글 목록/상세를 mock data가 아니라 API 응답 중심으로 교체

이 문서는 JungleLog 프로젝트를 끝까지 진행하기 위한 작업 기록장이다.
Trello의 전체 TODO 흐름을 기준으로, 각 단계가 완료되었는지 확인하고 다음 단계를 결정할 때 사용한다.

## 진행 방식

1. 사용자가 "다음 거 가보자"라고 하면 현재 진행 중인 단계의 완료 기준을 먼저 확인한다.
2. 완료 기준을 통과하면 다음 단계의 목표와 체크리스트를 안내한다.
3. 통과하지 못한 항목이 있으면 다음 단계로 넘어가기 전에 보완 작업을 먼저 진행한다.
4. 진행 중 계획이 바뀌면 Trello와 이 문서에 바로 반영한다.
5. 구현 작업이 있으면 [code.md](code.md) 컨벤션을 먼저 확인한다.
6. 구현이 끝나면 `README.md`와 [study.md](study.md)를 함께 업데이트한다.
7. 프론트엔드 작업 후에는 `npm run build` 성공 여부를 확인한다.

## 전체 단계

| 순서 | 단계 | 상태 |
| --- | --- | --- |
| 0 | 프로젝트 환경 세팅 및 문서 기준 정리 | 완료 |
| 1 | React mock UI 안정화 | 완료 |
| 2 | React 코드 이해 및 학습 정리 | 완료 |
| 3 | FastAPI 백엔드 기본 구조 구현 | 완료 |
| 4 | PostgreSQL DB 설계 및 연결 | 진행 중 |
| 5 | Google OAuth / 자동 가입 / JWT 인증 구현 | 예정 |
| 6 | 게시판 CRUD API 구현 | 예정 |
| 7 | 댓글 / 태그 / 페이징 / 검색 API 구현 | 예정 |
| 8 | 프론트엔드와 백엔드 API 연결 | 예정 |
| 9 | GitHub 프로젝트 등록 기능 구현 | 예정 |
| 10 | 포트폴리오 관리 기능 완성 | 예정 |
| 11 | RAG 기능 구현 | 예정 |
| 12 | MCP 서버 구현 | 예정 |
| 13 | AI Agent 기능 구현 | 예정 |
| 14 | 권한별 화면 및 API 보호 정리 | 예정 |
| 15 | 테스트 / 오류 처리 / 예외 처리 | 예정 |
| 16 | README / study.md / 제출 문서 정리 | 예정 |
| 17 | 데모 스크린샷 및 발표 준비 | 예정 |
| 18 | 최종 빌드 / 실행 검증 / 제출 | 예정 |

## 현재 완료 확인

### 0. 프로젝트 환경 세팅 및 문서 기준 정리

- 프로젝트 폴더 구조 확인 완료
- `frontend/`, `backend/`, `docs/` 구조 생성 완료
- 팀 레포 `project/junhee` 브랜치 연결 완료
- `README.md` 작성 완료
- [study.md](study.md) 작성 완료
- [code.md](code.md) 컨벤션 확인 완료
- PostgreSQL용 `docker-compose.yml` 준비 완료

### 1. React mock UI 안정화

- 모든 주요 화면 라우트 200 응답 확인
- 화면에 깨진 한글 검색 결과 없음
- `mockData.ts` 기반으로 화면별 데이터 연결 완료
- 게시글/내 기록/포트폴리오/코치 리뷰 검색 및 필터 mock 동작 구현
- STUDENT / COACH 역할별 화면 차이 구현
- 게시글 작성/수정/삭제/댓글 mock 동작 구현
- 포트폴리오 관리와 AI 도우미 흐름 연결 완료
- `npm run build` 성공 확인
- `README.md`와 [study.md](study.md) 업데이트 완료

## 현재 진행 단계

### 2. React 코드 이해 및 학습 정리

상태: 완료

목표는 기능을 더 추가하기 전에 지금 만든 React 코드를 직접 이해하는 것이다.

체크리스트:

- `routes.tsx` 라우트 구조 이해
- `MainLayout` 역할 이해
- `RoleGate` 역할 이해
- `mockData.ts` 데이터 구조 이해
- `Posts` 검색/필터 흐름 이해
- `PostDetail`의 `useParams` 흐름 이해
- `PostEdit`의 controlled input 흐름 이해
- `Portfolio`의 프로젝트 선택과 기록 연결 흐름 이해
- `AIAssistant`의 프로젝트 기반 생성 흐름 이해
- `CoachReview`의 STUDENT / COACH 분기 흐름 이해
- React component 개념 정리
- React state 개념 정리
- React Router 개념 정리
- TypeScript union type 개념 정리

완료 기준:

- 주요 파일을 읽고 각 파일의 역할을 말할 수 있다.
- mock data가 화면에서 어떻게 필터링되는지 설명할 수 있다.
- `useState`, `useParams`, `useSearchParams`, `useNavigate`가 어디서 쓰였는지 찾을 수 있다.
- [study.md](study.md)에 React 코드 이해 내용을 추가한다.

진행 기록:

- 2026-06-06: 2단계 시작. 라우트, 레이아웃, RoleGate, mockData, 주요 페이지 파일의 읽는 순서를 정리했다.
- 2026-06-10: `MainLayout`의 동작하지 않는 헤더 전역 검색 UI를 제거했다. 페이지별 검색은 유지하고, `test.md`를 반복 검증 체크리스트처럼 운영하도록 정리했다.
- 2026-06-11: `CoachReview`에서 리뷰 요청 state를 부모로 끌어올려 STUDENT / COACH 화면이 같은 mock 원본 요청 state를 공유하도록 정리했다. 학생은 본인 요청만, 코치는 mock `currentCoachId`에 배정된 요청만 필터링하도록 개선했다. 코치 피드백 전송 안내와 빈 피드백 방어 흐름을 추가했고 `npm run build` 성공을 확인했다.
- 2026-06-11: React Router 훅, state lifting, props, `useMemo`, role 기반 화면 분기까지 복습했으므로 2단계를 완료 처리하고 백엔드 기본 구조 구현으로 이동한다.
- 2026-06-11: 키워드 학습 문서를 `front-keyword.md`, `back-keyword.md`로 분리하고 중복 안내 문서를 정리했다.
- 2026-06-11: `test.md`를 자체 QA 체크리스트로 재정의하고, 실제 문제 해결 기록은 `troubleshooting.md`로 분리했다.

### 3. FastAPI 백엔드 기본 구조 구현

상태: 완료

목표는 게시판 API를 바로 완성하는 것이 아니라, FastAPI 서버가 정상 실행되고 기본 API가 응답하는 백엔드 뼈대를 만드는 것이다.

체크리스트:

- Python / pip / Docker 개발 환경 확인
- backend 가상환경 생성 또는 확인
- FastAPI / Uvicorn 설치
- `backend/app/main.py` 생성
- `backend/app/routers/health.py` 생성
- `/health` API 응답 확인
- Swagger 문서 `/docs` 확인
- CORS 설정 추가
- README와 study 문서에 백엔드 실행 방법 정리

완료 기준:

- `uvicorn app.main:app --reload`로 서버가 실행된다.
- `GET /health`가 `{ "status": "ok" }` 형태로 응답한다.
- `http://localhost:8000/docs`에서 Swagger 문서를 확인할 수 있다.
- 프론트엔드와 연결할 수 있도록 CORS 기본 설정이 들어가 있다.
- 백엔드 기본 구조와 실행 방법이 문서에 정리되어 있다.

진행 기록:

- 2026-06-11: 백엔드 세팅 명령어와 실행 방법을 계속 누적하기 위해 `setup.md`를 추가했다.
- 2026-06-11: FastAPI / Uvicorn 설치 후 `requirements.txt`를 생성했다.
- 2026-06-11: `main.py`와 `routers/health.py`를 구성하고 `/health`, `/docs` 응답을 확인했다.
- 2026-06-11: `pydantic-settings`를 추가하고 `.env` / `config.py` / `.env.example` 기반으로 앱 이름과 CORS origin 설정을 분리했다.
- 2026-06-11: `test.md` 기준으로 FastAPI 서버, `/health`, `/docs`, CORS, configuration QA를 통과했다.

### 4. PostgreSQL DB 설계 및 연결

상태: 진행 중

목표는 Docker Compose로 PostgreSQL을 실행하고, FastAPI가 DB에 연결할 수 있는 기반을 만드는 것이다.

체크리스트:

- Docker / Docker Compose 설치 확인
- `docker-compose.yml`의 PostgreSQL 설정 이해
- `docker compose up -d`로 PostgreSQL 컨테이너 실행
- `docker ps`로 `junglelog-postgres` 실행 상태 확인
- `docker logs junglelog-postgres`에서 readiness 로그 확인
- Docker volume 생성 확인
- `DATABASE_URL` 환경변수 추가
- SQLAlchemy / psycopg 설치
- `db/session.py`에서 DB engine/session 구성
- DB 연결 확인용 API 또는 스크립트 작성

완료 기준:

- `junglelog-postgres` 컨테이너가 `Up` 상태다.
- PostgreSQL이 `localhost:5432`에서 연결 가능하다.
- FastAPI 설정에서 `DATABASE_URL`을 읽을 수 있다.
- SQLAlchemy session 구성이 완료된다.
- DB 연결 확인이 성공한다.

진행 기록:

- 2026-06-11: Docker 29.2.1, Docker Compose v5.1.0 확인.
- 2026-06-11: `docker compose up -d`로 `junglelog-postgres` 컨테이너 실행 성공.
- 2026-06-11: `docker ps`에서 `0.0.0.0:5432->5432/tcp` 포트 매핑과 `Up` 상태 확인.
- 2026-06-11: `docker logs junglelog-postgres`에서 `database system is ready to accept connections` 확인.
- 2026-06-11: `week15_ai_board_postgres_data` volume 생성 확인.
- 2026-06-11: `SQLAlchemy`, `psycopg[binary]` 설치 후 `requirements.txt`를 갱신했다.
- 2026-06-11: `.env`, `.env.example`, `config.py`에 `DATABASE_URL` 설정을 추가했다.
- 2026-06-11: `db/session.py`에서 SQLAlchemy `engine`, `SessionLocal`, `get_db()` 구성을 완료했다.
- 2026-06-11: `/health/db` endpoint에서 `SELECT 1`을 실행해 FastAPI와 PostgreSQL 연결을 확인했다.
- 2026-06-11: `test.md` 기준으로 `/health`, `/health/db`, OpenAPI path, Docker 컨테이너 상태, backend compile QA를 통과했다.
- 2026-06-11: 프론트엔드 `npm run build`도 성공해 기존 React 화면이 깨지지 않았음을 확인했다.
- 2026-06-11: `docs/agent/db-design.md`에 dbdiagram.io용 ERD v1 DBML 초안을 작성했다.
- 2026-06-11: 인증 방식을 Google OAuth 단일 로그인으로 확정하고, `users` 테이블과 `/login` mock 화면에 반영했다.
- 2026-06-11: `/signup` 라우트와 화면을 제거했다. 첫 로그인 자동 가입은 Google OAuth callback에서 처리하고, v1의 학생/코치 권한은 관리자 승인 화면에서 지정한다.
- 2026-06-11: 정글 내부 서비스 정책에 맞춰 운영자 승인 구조를 v1에 포함했다. `ADMIN` role, `approval_status`, `/pending-approval`, `/admin/users`, `user_approval_logs`, `ADMIN_EMAILS` 초기 관리자 방식을 반영했다.
- 2026-06-11: 운영자 승인 구조 반영 후 프론트엔드 `npm run build`와 백엔드 `python -m compileall app` 검증을 통과했다.
- 2026-06-11: 승인 상태 표현을 `승인 대기 / 승인 완료 / 거절 / 정지`로 통일하고, role/승인상태 선택기는 개발용 mock UI임을 명시했다. 관리자 사이드바는 `사용자 승인`만 남기고, 관리자는 직접 URL 접근으로 전체 기록과 리뷰 요청을 확인할 수 있도록 정리했다.
- 2026-06-12: Google mock 로그인과 관리자 승인 화면을 QA했다. 로그인 클릭 시 신규 학생이 `승인 대기`로 이동하도록 수정했고, `RoleGate`에서 승인 상태 문제와 role 접근 제한 문구를 분리했다. 관리자 화면은 role 선택값을 draft로 들고 있다가 `승인 적용`에서 role과 `승인 완료`를 함께 반영하도록 정리했다.
- 2026-06-12: DB 설계 v1을 Google OAuth/관리자 승인 정책 기준으로 보정했다. `user_approval_logs.actor_id`를 초기 관리자 자동 생성에 맞게 nullable로 바꾸고, `action`, `approval_note`, 리뷰 상태 목록, 포트폴리오/코치 피드백 상태 목록, v1 확정 결정을 문서화했다.
- 2026-06-12: `db-design.md`에 테이블별 필드 의미, 타입을 선택한 이유, 현재 화면 기능과의 연결, dbdiagram.io ERD 그림 읽는 법을 추가했다. `post_categories`는 `posts.category_id`, `review_requests.category_id`와 연결되는 기준 테이블임을 명확히 적었다.
- 2026-06-12: `db-design.md` Preview에서 설명이 바로 보이도록 타입/필드/ERD 그림 읽는 법 섹션을 DBML 코드블록 위로 이동했다. dbdiagram.io 그림은 문서 수정만으로 자동 갱신되지 않고 DBML을 다시 붙여넣어야 한다는 안내를 추가했다.

## 백엔드 연결 후 구현 예정

- Google OAuth 로그인과 첫 로그인 자동 가입
- 실제 로그인 사용자 role 판별
- 운영자 승인 상태 판별
- JWT 기반 라우트 보호
- 사용자 승인 / 거절 / 정지 / role 변경 API
- 실제 게시글 CRUD API 연결
- 실제 댓글 저장/삭제 API 연결
- 실제 프로젝트-게시글 연결 저장
- 실제 GitHub API 분석 결과 저장
- 실제 OpenAI/RAG/MCP/Agent 호출

## 2026-06-12 DB 설계와 현재 화면 매핑 QA

상태: 완료

목표: 현재 React mock UI에서 쓰는 데이터가 ERD v1에 저장될 수 있는지 확인했다.

확인한 화면:

- 로그인/승인 대기/관리자 사용자 승인
- 전체 게시글/게시글 상세/게시글 작성/수정/댓글
- 내 기록
- 포트폴리오 관리/기록 연결하기
- AI 도우미
- 코치 리뷰 요청/코치 인박스
- 알림 드롭다운

QA 결과:

- 전체 구조는 현재 화면 흐름과 맞다.
- `users`, `posts`, `comments`, `post_categories`, `tags`, `post_tags`, `portfolio_projects`, `portfolio_project_posts`, `review_requests`, `review_request_coaches`, `notifications`로 v1 화면 대부분을 설명할 수 있다.
- 화면에서 계산되는 `comments` 수, `linkedRecordCount`, `requesterName`, `coachNames`, `targetTitle`은 DB에 중복 저장하지 않고 JOIN/count 결과로 만든다.
- 게시글의 `contentSections`는 v1에서 `posts.content text`에 Markdown/본문 문자열로 저장한다.
- `MockPost.relatedCommit`은 저장 위치가 애매해서 `posts.related_commit text`를 DBML에 추가했다.
- `PortfolioProject.summary`는 저장 위치가 애매해서 `portfolio_projects.summary text`를 DBML에 추가했다.

다음 작업:

- SQLAlchemy model 작성 시 `db-design.md`의 보정된 DBML을 기준으로 삼는다.
- 먼저 `users`, `post_categories`, `posts`부터 모델을 만들고, 그 다음 댓글/태그/포트폴리오/코치 리뷰로 확장한다.

## 2026-06-12 DB 필드별 선언 이유 학습 문서 보강

상태: 완료

목표: ERD와 테이블 필드를 보면서 학습할 수 있도록, 각 필드가 왜 필요한지 `db-design.md`에 명시했다.

진행 내용:

- `users`부터 `notifications`까지 v1 테이블의 모든 필드에 대해 선언 이유를 정리했다.
- 각 필드가 어떤 화면/기능과 연결되는지 설명했다.
- `post_tags`, `portfolio_project_posts`, `review_request_coaches`처럼 N:M 연결 테이블이 왜 필요한지 따로 설명했다.
- 화면에는 보이지만 DB에는 저장하지 않고 JOIN/count로 만드는 값도 분리했다.

다음 작업:

- SQLAlchemy model을 만들 때 `db-design.md`의 필드별 선언 이유를 보면서 컬럼을 옮긴다.
- 모델 작성 후에는 각 모델이 어떤 화면 데이터를 책임지는지 다시 QA한다.

## 2026-06-12 DB 설계와 프론트 mock data 재점검

상태: 완료

목표: `db-design.md`의 ERD v1이 현재 프론트엔드 mock 화면과 실제 API 연결 시 자연스럽게 이어지는지 확인했다.

결과:

- 현재 DB 설계는 프론트엔드 주요 화면과 연결 가능하다.
- 새 테이블을 추가할 필요는 없다.
- 기존 보정 컬럼인 `posts.related_commit`, `portfolio_projects.summary` 덕분에 핵심 mock 필드의 저장 위치는 맞춰졌다.
- `Category.count`, `MockPost.comments`, `PortfolioProject.linkedRecordCount`, `ReviewRequest.coachNames`, `ReviewRequest.targetTitle`, `notifications.time`은 DB에 중복 저장하지 않고 JOIN/count/날짜 계산으로 만든다.
- `contentSections`는 v1에서 `posts.content` 문자열로 저장하고, 구조화 저장은 v2에서 검토한다.
- `tech_stack`은 v1에서 `portfolio_projects.tech_stack` text로 충분하고, 고급 검색/통계가 필요해지면 v2에서 분리한다.

다음 작업:

- SQLAlchemy model 작성 시 DB 컬럼명과 프론트 응답 필드명이 다를 수 있음을 의식한다.
- API schema를 만들 때 `view_count -> views`, `is_public -> isPublic`, `repo_full_name -> repo`처럼 프론트가 쓰기 좋은 응답으로 변환한다.

## 2026-06-12 Google OAuth 이름 저장 정책 정리

상태: 완료

정리 내용:

- `users.name`은 Google 원본 이름이 아니라 JungleLog 안에서 보여줄 서비스 표시 이름으로 정의했다.
- 첫 로그인 때 Google `name`을 `users.name`의 초기값으로 사용한다.
- 사용자가 설정 화면에서 이름을 바꾸면 `users.name`을 수정한다.
- 이후 Google 로그인 때마다 Google `name`으로 `users.name`을 덮어쓰지 않는다.
- Google 원본 이름 보존이 필요해지면 v2에서 `google_name` 또는 `oauth_name` 컬럼을 추가한다.

다음 OAuth 구현 시 주의할 점:

- OAuth callback에서 `google_sub`로 기존 사용자를 찾는다.
- 기존 사용자가 있으면 `email`, `profile_image_url`, `last_login_at` 정도만 갱신하고, 사용자가 바꾼 `name`은 유지한다.
- 신규 사용자일 때만 Google `name`으로 `users.name`을 초기화한다.

## 2026-06-13 SQLAlchemy 모델 1차 구현

상태: 완료

목표: ERD v1에서 가장 먼저 필요한 `users`, `post_categories`, `posts` 테이블을 SQLAlchemy 모델 코드로 옮겼다.

구현한 파일:

- `backend/app/db/models/user.py`
- `backend/app/db/models/post_category.py`
- `backend/app/db/models/post.py`
- `backend/app/db/models/__init__.py`

구현 내용:

- `User` 모델에 Google OAuth 사용자, role, 승인 상태, 승인자, 생성/수정 시간을 선언했다.
- `PostCategory` 모델에 카테고리 slug, label, 생성/수정 시간을 선언했다.
- `Post` 모델에 작성자, 카테고리, 제목, 요약, 본문, 연결 커밋, 공개 여부, 조회수, soft delete 시간을 선언했다.
- `Post.author_id -> users.id`, `Post.category_id -> post_categories.id` 외래키를 연결했다.
- `User.posts`, `Post.author`, `Post.category`, `PostCategory.posts` 관계를 선언했다.

검증:

- 가상환경 Python으로 `python -m compileall app` 성공.
- `Base.metadata.tables`에 `post_categories`, `posts`, `users`가 등록되는 것을 확인했다.

주의:

- 시스템 Python으로 확인하면 `sqlalchemy`가 없어서 실패할 수 있다.
- 백엔드 검증은 `backend/.venv/Scripts/python.exe` 또는 가상환경 활성화 후 실행해야 한다.

다음 작업:

- 테이블 생성 방식을 결정한다. 초보 학습 단계에서는 `Base.metadata.create_all()`로 먼저 테이블 생성 흐름을 확인하고, 이후 Alembic migration으로 넘어가는 방향이 좋다.
- 그다음 기본 카테고리 seed 데이터를 넣는다.

## 2026-06-13 DB 테이블 생성과 카테고리 seed 구현

상태: 완료

목표: SQLAlchemy 모델로 선언한 `users`, `post_categories`, `posts` 테이블을 실제 PostgreSQL에 생성하고, 기본 게시글 카테고리를 넣었다.

구현한 파일:

- `backend/app/db/init_db.py`

구현 내용:

- `create_tables()`에서 `Base.metadata.create_all(bind=engine)`을 실행한다.
- `seed_post_categories()`에서 기본 카테고리 5개를 넣는다.
- 이미 존재하는 `slug`는 다시 넣지 않도록 처리해 seed가 중복되지 않게 했다.
- `init_db()`에서 테이블 생성과 카테고리 seed를 함께 실행한다.

실행한 명령:

```powershell
.\.venv\Scripts\python.exe -c "from app.db.init_db import init_db; init_db(); print('init_db done')"
```

검증:

- 실제 PostgreSQL 테이블 목록: `post_categories`, `posts`, `users`
- 기본 카테고리 5개 확인:
  - `learning-log`
  - `troubleshooting`
  - `retrospective`
  - `interview`
  - `portfolio`
- `init_db()`를 다시 실행해도 카테고리 개수가 5개로 유지됨을 확인했다.

다음 작업:

- `comments`, `tags`, `post_tags` 모델을 추가한다.
- 그다음 게시글 조회 API에서 `posts`, `users`, `post_categories`를 JOIN해 프론트 응답 모양으로 내려주는 흐름을 만든다.

## 2026-06-13 댓글/태그 모델 추가

상태: 완료

목표: 게시글 상세 댓글과 게시글 태그 표시/검색을 위해 `comments`, `tags`, `post_tags` 모델을 추가했다.

구현한 파일:

- `backend/app/db/models/comment.py`
- `backend/app/db/models/tag.py`
- `backend/app/db/models/post_tag.py`
- `backend/app/db/models/user.py`
- `backend/app/db/models/post.py`
- `backend/app/db/models/__init__.py`

구현 내용:

- `Comment` 모델을 추가했다.
  - `post_id -> posts.id`
  - `author_id -> users.id`
  - `content`, `created_at`, `updated_at`, `deleted_at`
- `Tag` 모델을 추가했다.
  - `name`, `slug`, `created_at`, `updated_at`
- `PostTag` 모델을 추가했다.
  - `post_id + tag_id`를 복합 primary key로 사용한다.
  - 게시글과 태그의 N:M 관계를 연결한다.
- `User.comments`, `Post.comments` 관계를 추가했다.
- `Post.post_tags`, `Tag.post_tags`, `PostTag.post`, `PostTag.tag` 관계를 추가했다.

검증:

- 가상환경 Python 기준 `python -m compileall app` 성공.
- `Base.metadata.tables`에 `comments`, `tags`, `post_tags`가 등록되는 것을 확인했다.
- `init_db()` 실행 후 실제 PostgreSQL 테이블 목록에 `comments`, `tags`, `post_tags`가 추가됐다.
- 새 테이블들은 아직 seed 데이터가 없어 count가 0인 상태다.

다음 작업:

- 게시글 조회 API 응답 형태를 위한 Pydantic schema를 작성한다.
- 이후 repository/service/router 흐름으로 `GET /posts`, `GET /posts/{post_id}`를 만든다.

## 2026-06-13 4단계 API 설계와 게시글 조회 API 시작

상태: 1차 완료

목표: 프론트 mock data를 실제 API 응답으로 바꾸기 전에 API 계약을 먼저 문서화하고, 가장 작은 범위로 게시글 목록/상세 조회 API를 구현한다.

구현한 파일:

- `docs/agent/api-design.md`
- `backend/app/schemas/post.py`
- `backend/app/repositories/post_repository.py`
- `backend/app/services/post_service.py`
- `backend/app/routers/posts.py`
- `backend/app/main.py`
- `backend/app/db/init_db.py`

구현 내용:

- `docs/agent/api-design.md`에 JungleLog API 설계 v1을 추가했다.
- 4단계 1차 구현 범위를 `GET /posts`, `GET /posts/{post_id}`로 정했다.
- 게시글 목록 응답은 `items`, `total`, `page`, `size` 구조로 설계했다.
- DB 컬럼 이름과 프론트 응답 이름이 다를 수 있음을 명시했다.
- `PostListResponse`, `PostDetailResponse` Pydantic schema를 만들었다.
- DB 조회는 repository, 응답 조립은 service, HTTP endpoint는 router로 분리했다.
- 개발용 demo 사용자/게시글/태그 seed를 추가했다.

검증 결과:

- `init_db()`를 다시 실행해 demo 게시글 seed가 정상 동작함을 확인했다.
- `GET /posts`가 HTTP 200과 demo 게시글 3개를 반환했다.
- `GET /posts?category=learning-log`가 HTTP 200과 1개 결과를 반환했다.
- `GET /posts?keyword=JWT`가 HTTP 200과 1개 결과를 반환했다.
- `GET /posts/999999`가 HTTP 404를 반환했다.
- OpenAPI schema에 `/posts`, `/posts/{post_id}`가 등록되어 있음을 확인했다.
- `python -m compileall app`이 성공했다.
- `npm run build`가 성공했다.

다음 작업:

- 게시글 조회 API 코드를 파일별로 학습한다.
- 댓글 조회 API 설계를 시작한다.
- 이후 게시글 작성/수정/삭제 API로 확장한다.

## 2026-06-13 게시글 조회 API 학습용 주석 추가

상태: 완료

목표: 초보자가 4단계 게시글 조회 API 구현 흐름을 파일별로 따라갈 수 있도록 학습용 주석을 촘촘히 추가한다.

수정한 파일:

- `backend/app/main.py`
- `backend/app/routers/posts.py`
- `backend/app/services/post_service.py`
- `backend/app/repositories/post_repository.py`
- `backend/app/schemas/post.py`
- `backend/app/db/init_db.py`
- `docs/agent/study.md`

검증:

- `python -m compileall app` 성공
- `npm run build` 성공

다음 작업:

- 주석을 기준으로 게시글 조회 API 흐름을 학습한다.
- 그다음 댓글 조회 API 또는 남은 SQLAlchemy 모델 6개 추가 중 하나를 선택한다.

## 2026-06-13 ERD v1 남은 6개 SQLAlchemy 모델 추가

상태: 완료

목표: DB 설계 문서의 v1 테이블 12개를 모두 SQLAlchemy 모델과 실제 PostgreSQL 테이블로 반영한다.

추가한 모델 파일:

- `backend/app/db/models/user_approval_log.py`
- `backend/app/db/models/portfolio_project.py`
- `backend/app/db/models/portfolio_project_post.py`
- `backend/app/db/models/review_request.py`
- `backend/app/db/models/review_request_coach.py`
- `backend/app/db/models/notification.py`

수정한 파일:

- `backend/app/db/models/user.py`
- `backend/app/db/models/post.py`
- `backend/app/db/models/post_category.py`
- `backend/app/db/models/__init__.py`

구현 내용:

- 관리자 승인 이력 저장용 `user_approval_logs` 모델을 추가했다.
- GitHub repo 기반 포트폴리오 프로젝트 저장용 `portfolio_projects` 모델을 추가했다.
- 포트폴리오 프로젝트와 게시글 N:M 연결용 `portfolio_project_posts` 모델을 추가했다.
- 학생이 코치에게 보내는 리뷰 요청용 `review_requests` 모델을 추가했다.
- 리뷰 요청과 코치 N:M 연결용 `review_request_coaches` 모델을 추가했다.
- 사용자별 알림용 `notifications` 모델을 추가했다.
- `users`, `posts`, `post_categories`와 새 모델들의 `relationship`을 연결했다.
- `models/__init__.py`에 새 모델을 등록해 `Base.metadata.create_all()`이 인식하도록 했다.

검증:

- `python -m compileall app` 성공
- SQLAlchemy `configure_mappers()` 성공
- `init_db()` 실행 성공
- 실제 PostgreSQL 테이블 12개 확인
- `npm run build` 예정

현재 실제 테이블:

```txt
comments
notifications
portfolio_project_posts
portfolio_projects
post_categories
post_tags
posts
review_request_coaches
review_requests
tags
user_approval_logs
users
```

다음 작업:

- 이번에 추가한 DB 모델 관계를 학습한다.
- 이후 댓글 API 또는 게시글 작성/수정/삭제 API로 이동한다.

## 2026-06-13 구현 완료 후 커밋 안내 규칙 추가

상태: 완료

목표: 앞으로 기능 구현 단위가 끝날 때마다 커밋 시점과 추천 커밋 제목을 안내하도록 작업 규칙에 반영한다.

수정한 파일:

- `docs/agent/agent.md`
- `docs/agent/code.md`
- `docs/agent/log.md`

반영한 규칙:

- 구현 완료 후 커밋 가능한 시점을 알려준다.
- 추천 커밋 제목을 함께 제안한다.
- 코드 작성 시 학습용 주석을 남긴다.
- 구현할 때마다 `docs/agent` 문서를 참고하고 필요한 문서를 업데이트한다.

추천 커밋 제목:

```txt
docs: 작업 운영 규칙에 커밋 안내 추가
```

## 2026-06-13 댓글 조회 API와 프론트 연결 QA

상태: 완료

목표: 게시글 상세 화면에서 백엔드 댓글 조회 API를 호출하고, API 응답을 프론트 댓글 state에 반영한다.

구현/수정한 파일:

- `backend/app/schemas/comment.py`
- `backend/app/repositories/comment_repository.py`
- `backend/app/services/comment_service.py`
- `backend/app/routers/comments.py`
- `backend/app/main.py`
- `frontend/src/app/api/comments.ts`
- `frontend/src/app/pages/posts/PostDetail.tsx`

확인 중 발견한 문제:

- comments router가 `/posts/{post_id}`로 등록되어 기존 게시글 상세 API와 충돌할 수 있었다.
- 프론트 `PostDetail`이 댓글 API가 아니라 `/posts/{id}` 게시글 상세 API를 fetch하고 있었다.
- `useEffect` dependency가 `[comments]`라 댓글 state 변경 때마다 다시 호출될 수 있었다.

수정:

- 댓글 endpoint를 `GET /posts/{post_id}/comments`로 수정했다.
- 게시글이 없으면 404를 반환하도록 router에서 `HTTPException` 처리했다.
- 프론트 API 호출을 `frontend/src/app/api/comments.ts`로 분리했다.
- `PostDetail`에서 댓글 API 응답을 화면 state로 변환하도록 수정했다.
- 댓글 로딩, 실패, 빈 목록 UI를 추가했다.

검증:

- `python -m compileall app` 성공
- OpenAPI path에 `/posts/{post_id}/comments` 등록 확인
- `npm run build` 성공
- `GET /posts/1/comments` -> 200, `total=0`
- `GET /posts/999999/comments` -> 404
- CORS header `access-control-allow-origin=http://localhost:5173` 확인

추천 커밋 제목:

```txt
feat: 댓글 조회 API와 게시글 상세 연결
```
