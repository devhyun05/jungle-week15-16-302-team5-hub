# JungleLog Progress Log

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
| 2 | React 코드 이해 및 학습 정리 | 진행 중 |
| 3 | FastAPI 백엔드 기본 구조 구현 | 예정 |
| 4 | PostgreSQL DB 설계 및 연결 | 예정 |
| 5 | 회원가입 / 로그인 / JWT 인증 구현 | 예정 |
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

목표는 기능을 더 추가하기 전에 지금 만든 React 코드를 직접 이해하는 것이다.

진행 문서: [stage-2-react-code-reading.md](stage-2-react-code-reading.md)

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

## 백엔드 연결 후 구현 예정

- 실제 로그인 사용자 role 판별
- JWT 기반 라우트 보호
- 실제 게시글 CRUD API 연결
- 실제 댓글 저장/삭제 API 연결
- 실제 프로젝트-게시글 연결 저장
- 실제 GitHub API 분석 결과 저장
- 실제 OpenAI/RAG/MCP/Agent 호출
