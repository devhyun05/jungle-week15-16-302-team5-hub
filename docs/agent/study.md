# Study Notes

## 2026-06-06 React Mock UI 안정화와 프로젝트 구조 정리

이번 작업은 백엔드 연결 전 React mock UI 단계에서 화면 흐름을 안정화하고, 프로젝트 폴더를 도메인별로 정리한 작업이다.

## 수정한 주요 파일

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/routes.tsx` | URL path와 page component를 연결하는 라우트 정의 |
| `frontend/src/app/pages/dashboard/Dashboard.tsx` | 학생/코치 대시보드 화면 |
| `frontend/src/app/pages/posts/Posts.tsx` | 전체 게시글 목록, 카테고리 필터, 검색 |
| `frontend/src/app/pages/posts/PostDetail.tsx` | 게시글 상세, 삭제 mock, 댓글 mock |
| `frontend/src/app/pages/posts/PostEdit.tsx` | 게시글 작성/수정 mock form |
| `frontend/src/app/pages/posts/MyRecords.tsx` | 내 기록 필터와 검색 |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | GitHub 프로젝트 등록, 기록 연결, 포트폴리오 상태 관리 |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | 프로젝트 기반 AI 도우미 mock 화면 |
| `frontend/src/app/pages/coach/CoachReview.tsx` | 학생 리뷰 요청 화면과 코치 인박스 화면 |
| `frontend/src/app/pages/auth/Login.tsx` | 로그인 mock 화면 |
| `frontend/src/app/pages/auth/Signup.tsx` | 회원가입 mock 화면 |
| `frontend/src/app/pages/settings/Settings.tsx` | 설정 mock 화면 |
| `frontend/src/app/data/mockData.ts` | 화면에서 쓰는 mock posts, projects, reviewRequests, notifications |
| `docs/project-structure.md` | 프로젝트 폴더 역할 정리 |
| `docs/react-mock-ui-boundary.md` | mock UI 단계와 백엔드 이후 구현 범위 구분 |
| `README.md` | 현재 구현 상태, 라우트, 실행 방법 정리 |

## 이번 구현에서 사용한 React 개념

### Component

React 화면은 여러 component로 나뉜다.
예를 들어 `Posts`, `PostDetail`, `Portfolio`, `AIAssistant`는 각각 하나의 page component다.

### State

`useState`는 화면에서 바뀌는 값을 저장한다.

이번 작업에서 state로 관리한 예:

- 검색어: `keyword`
- 선택한 카테고리: `selectedCategory`
- 선택한 포트폴리오 프로젝트: `selectedProjectId`
- 연결할 게시글 id 목록: `selectedPostIds`
- 댓글 입력값: `commentInput`
- 코치 리뷰 요청 목록: `requests`

### Derived Data

`useMemo`는 state와 mock data를 바탕으로 계산된 목록을 만든다.

예:

- 검색어와 카테고리로 필터링된 게시글 목록
- 선택한 프로젝트에 연결된 게시글 목록
- 코치 리뷰 인박스 검색 결과

### Controlled Input

input, textarea, select의 값은 React state와 연결했다.

예:

```tsx
<Input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
```

이 구조를 이해하면 검색창, 글쓰기 폼, select 필터가 어떻게 동작하는지 읽을 수 있다.

### React Router

`routes.tsx`에서 URL과 화면 component를 연결한다.

예:

- `/posts` -> `Posts`
- `/posts/:id` -> `PostDetail`
- `/portfolio` -> `Portfolio`
- `/ai-assistant` -> `AIAssistant`

`useParams`는 `/posts/:id`의 id 값을 읽을 때 사용한다.
`useSearchParams`는 `/posts?category=learning-log` 같은 query string을 읽고 바꿀 때 사용한다.
`useNavigate`는 버튼 클릭 후 다른 페이지로 이동할 때 사용한다.

### Conditional Rendering

조건에 따라 다른 UI를 보여준다.

예:

- role이 `STUDENT`면 학생용 코치 리뷰 요청 화면
- role이 `COACH`면 코치 리뷰 인박스
- 게시글 id가 없으면 “게시글을 찾을 수 없습니다”
- 대기 중인 리뷰 요청만 취소 버튼 표시

## 이번 구현에서 사용한 TypeScript 개념

### Union Type

몇 가지 값만 허용해야 할 때 union type을 쓴다.

예:

```ts
export type UserRole = "STUDENT" | "COACH";
export type ReviewStatus = "대기 중" | "검토 중" | "피드백 완료" | "수정 요청" | "최종 확인";
```

이렇게 작성하면 잘못된 문자열을 상태로 넣는 실수를 줄일 수 있다.

### Type Import

값이 아니라 타입만 가져올 때는 `type` import를 쓴다.

예:

```ts
import { posts, type CategorySlug } from "../../data/mockData";
```

### Array Type

여러 개의 id나 tag를 state로 관리할 때 배열 타입을 사용한다.

예:

```ts
const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
```

## 코드 흐름 이해 포인트

### 게시글 목록 검색 흐름

```txt
검색창 입력
-> keyword state 변경
-> posts.filter 실행
-> 제목, 요약, 태그, 카테고리, 작성자 기준으로 필터링
-> 필터링된 목록 렌더링
```

### 게시글 상세 흐름

```txt
/posts/:id 접속
-> useParams로 id 읽기
-> mock posts에서 id가 같은 글 찾기
-> 글 내용 렌더링
-> 댓글 작성 시 comments state에 추가
-> 삭제 확인 시 mock 안내 후 /posts로 이동
```

### 포트폴리오 관리 흐름

```txt
GitHub repo URL 입력
-> GitHub 프로젝트 등록 버튼 클릭
-> projects state에 mock project 추가
-> 프로젝트 카드 선택
-> 기록 연결하기 클릭
-> mock posts 체크
-> 연결 완료 시 selected project의 linkedPostIds 변경
-> AI 도우미로 이동
```

### AI 도우미 흐름

```txt
내 프로젝트 선택
-> 선택된 portfolioProject 찾기
-> linkedPostIds로 연결 기록 찾기
-> GitHub 정보와 JungleLog 기록을 참고 자료 패널에 표시
-> 포트폴리오 글 또는 면접 예상 질문 mock 결과 표시
-> 포트폴리오 초안으로 mock 저장
```

### 코치 리뷰 흐름

```txt
STUDENT
-> 리뷰 대상 선택
-> 코치 여러 명 선택
-> 요청 메시지 입력
-> 리뷰 요청 생성
-> 대기 중 요청은 취소 가능

COACH
-> 리뷰 요청 인박스 확인
-> 학생/제목/카테고리/메시지 검색
-> 요청 선택
-> 피드백 작성
-> 검토 중 / 수정 요청 / 피드백 완료 / 최종 확인 상태 변경
```

## 백엔드와 연결될 부분

현재는 모두 mock UI라 새로고침하면 변경된 화면 상태가 사라진다.

나중에 백엔드와 연결할 부분:

- 로그인 사용자 정보와 role
- 게시글 작성 / 수정 / 삭제
- 댓글 작성 / 삭제
- 게시글 검색과 페이징
- 포트폴리오 프로젝트 등록 / 조회 / 수정
- 프로젝트와 게시글 연결 저장
- 코치 리뷰 요청 생성 / 취소 / 상태 변경
- 알림 목록 조회
- GitHub repo 분석
- OpenAI 생성 결과 저장
- RAG 검색
- MCP tool 호출
- Agent 실행 루프

## 내가 이해해야 할 핵심 포인트

- 지금 화면에서 바뀌는 데이터는 대부분 `useState`에 저장된다.
- `mockData.ts`는 임시 DB처럼 쓰이고 있지만 실제 저장소는 아니다.
- URL과 화면 연결은 `routes.tsx`에서 한다.
- `RoleGate`는 현재 mock role로 접근 제한을 보여준다.
- 실제 서비스에서는 role을 local state가 아니라 JWT와 백엔드 인증 결과로 판단해야 한다.
- AI 도우미는 직접 입력이 아니라 포트폴리오 관리에 등록된 프로젝트를 기반으로 동작한다.
- README는 생성 대상이 아니라 GitHub에서 가져온 참고 자료로만 사용한다.

## 추가로 공부할 키워드

- React component
- React state
- controlled input
- conditional rendering
- React Router
- `useParams`
- `useSearchParams`
- `useNavigate`
- TypeScript union type
- TypeScript type import
- mock data와 API 응답의 차이
- JWT 인증
- FastAPI router
- PostgreSQL CRUD
- RAG
- MCP
- OpenAI function calling
- AI Agent loop

## 2026-06-06 진행 관리 방식 정리

이번에 `docs/agent/log.md`를 추가해서 Trello의 전체 TODO 흐름과 프로젝트 내부 기록을 맞춰 관리하기로 했다.

### 왜 docs/agent/log.md를 만들었는가

- Trello는 진행 상황을 보기 좋게 관리하는 도구다.
- `docs/agent/log.md`는 프로젝트 저장소 안에서 현재 단계, 완료 기준, 다음 단계를 기록하는 문서다.
- Trello가 바뀌거나 기억이 흐려져도 저장소 안의 문서만 보면 현재 어디까지 왔는지 확인할 수 있다.

### 앞으로 진행하는 방식

1. 사용자가 "다음 거 가보자"라고 말하면 현재 단계의 완료 기준을 먼저 확인한다.
2. 완료 기준을 통과하면 다음 단계의 목표와 체크리스트를 안내한다.
3. 통과하지 못한 항목이 있으면 다음 단계로 넘어가기 전에 보완한다.
4. 진행 중 계획이 바뀌면 Trello와 `docs/agent/log.md`에 같이 반영한다.
5. 구현이 끝나면 `README.md`와 `docs/agent/study.md`를 같이 업데이트한다.

### 현재 단계 판단

- 0단계 프로젝트 환경 세팅 및 문서 기준 정리: 완료
- 1단계 React mock UI 안정화: 완료
- 2단계 React 코드 이해 및 학습 정리: 진행 중

### 내가 이해해야 할 포인트

- 기능 구현만큼 중요한 것이 현재 단계의 완료 기준을 명확히 아는 것이다.
- React 화면을 더 만들기 전에 지금 만든 코드가 어떤 개념으로 돌아가는지 이해해야 한다.
- 다음 백엔드 단계로 넘어가기 전에 mock data와 실제 API 응답의 차이를 설명할 수 있어야 한다.

## 2026-06-06 2단계 React 코드 읽기 시작

2단계는 기능을 더 만드는 단계가 아니라, 지금 만든 React mock UI를 내가 직접 설명할 수 있게 만드는 단계다.

### 이번에 만든 학습 문서

- [stage-2-react-code-reading.md](stage-2-react-code-reading.md)

### 읽을 순서

1. `routes.tsx`에서 URL과 Page Component 연결을 본다.
2. `MainLayout.tsx`에서 전체 레이아웃, role state, 알림 드롭다운을 본다.
3. `RoleGate.tsx`에서 접근 제한 UI를 본다.
4. `mockData.ts`에서 화면이 쓰는 데이터 구조를 본다.
5. `Posts.tsx`, `PostDetail.tsx`, `PostEdit.tsx`, `MyRecords.tsx`에서 게시글 흐름을 본다.
6. `Portfolio.tsx`, `AIAssistant.tsx`에서 포트폴리오와 AI 도우미 연결 흐름을 본다.
7. `CoachReview.tsx`, `Dashboard.tsx`에서 STUDENT / COACH 역할 분기를 본다.

### 오늘 확인한 핵심 구조

- `routes.tsx`는 URL과 화면 컴포넌트를 연결한다.
- `MainLayout`은 현재 role과 공통 레이아웃을 관리한다.
- `RoleGate`는 허용된 role이 아니면 접근 제한 화면을 보여준다.
- `mockData.ts`는 지금 단계에서 임시 DB처럼 쓰인다.
- 게시글 목록은 `useSearchParams`와 `filter`로 카테고리/검색어를 처리한다.
- 게시글 상세는 `useParams`로 URL의 id를 읽고 `posts.find`로 데이터를 찾는다.
- 포트폴리오 관리는 `projects` state로 프로젝트 선택, 등록, 기록 연결을 mock 처리한다.
- AI 도우미는 선택된 프로젝트와 연결된 기록을 참고 자료처럼 보여준다.
- 코치 리뷰는 role에 따라 학생용 요청 화면과 코치용 인박스 화면으로 나뉜다.
