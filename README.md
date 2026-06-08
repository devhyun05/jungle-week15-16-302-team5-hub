# JungleMarket

JungleMarket은 크래프톤 정글 내부 구성원을 위한 중고거래 게시판 서비스입니다.

현재는 React + Vite 기반 프론트엔드를 우선 구현하고 있으며, 백엔드는 추후 FastAPI와 PostgreSQL을 연결할 예정입니다. 로그인은 실제 Slack OAuth 연동 전까지 프론트엔드 mock 로그인으로 동작합니다.

## 프로젝트 목표

- 정글 내부 구성원이 중고 물품을 쉽게 탐색할 수 있도록 한다.
- 로그인한 사용자는 판매글 작성, 수정, 마이페이지 기능을 사용할 수 있도록 한다.
- 추후 RAG, MCP, AI Agent 기능을 붙일 수 있는 게시판 기반 구조를 만든다.

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Auth | Mock Slack Login |
| Backend 예정 | FastAPI |
| Database 예정 | PostgreSQL |

## 실행 방법

### 1. Node 버전 확인

Vite 8 기준으로 Node.js 20.19 이상 또는 22.12 이상이 필요합니다.

```bash
node -v
```

nvm을 사용한다면 다음처럼 실행합니다.

```bash
nvm use 22
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 기본적으로 다음 주소에서 실행됩니다.

```text
http://localhost:5173
```

## 주요 기능

### 비로그인 사용자

- 홈 화면에서 중고거래 글 목록 조회
- 검색창 UI 확인
- 카테고리 필터 UI 확인
- 정렬 옵션 UI 확인
- 상품 상세 페이지 조회
- 로그인 페이지 접근

### 로그인 사용자

- Slack mock 로그인
- 상단 navbar에서 글쓰기 버튼 확인
- 판매글 작성 페이지 접근
- 판매글 수정 페이지 접근
- 마이페이지 접근
- 프로필 수정 페이지 접근
- 로그아웃

## 현재 구현된 페이지

| 페이지 | 경로 | 설명 |
| --- | --- | --- |
| Home | `/` | 상품 목록, 검색, 카테고리, 정렬 UI |
| Login | `/login` | Slack mock 로그인 |
| Post Details | `/post-details/:postId` | 상품 상세, 판매자 정보, 댓글 문의 |
| Post Create | `/post-create` | 판매글 작성 폼 |
| Post Edit | `/post-edit` | 판매글 수정 폼 |
| Profile | `/profile` | 내 글, 댓글 내역, 프로필 요약 |
| Profile Edit | `/profile-edit` | 프로필 수정 폼 |

## 프로젝트 구조

```text
src/
├── components/
│   ├── AuthLayout.tsx
│   ├── CommentList.tsx
│   ├── Header.tsx
│   ├── JungleMarketLogo.tsx
│   ├── PostForm.tsx
│   └── ProductCard.tsx
├── lib/
│   └── mockAuth.ts
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── PostCreate.tsx
│   ├── PostDetails.tsx
│   ├── PostEdit.tsx
│   ├── Profile.tsx
│   └── ProfileEdit.tsx
├── App.tsx
└── main.tsx
```

## 인증 흐름

현재는 실제 Slack OAuth가 아니라 mock 로그인으로 동작합니다.

```text
Slack으로 계속하기 클릭
→ localStorage에 mock user 저장
→ 홈 화면으로 이동
→ 로그인 사용자 전용 메뉴 표시
```

추후 백엔드 구현 시 `src/lib/mockAuth.ts`를 실제 인증 로직으로 교체할 예정입니다.

## 문서

| 문서 | 설명 |
| --- | --- |
| [Wireframe](./docs/wireframe/README.md) | 와이어프레임 이미지와 화면 설명 |
| [Troubleshooting](./docs/troubleshooting/README.md) | 개발 중 발생한 문제와 해결 방법 |

## 개발 메모

- 글 목록과 상세 조회는 비로그인 사용자도 접근할 수 있습니다.
- 글쓰기, 글 수정, 마이페이지, 프로필 수정은 로그인 사용자만 접근할 수 있습니다.
- 회원가입 페이지는 현재 사용하지 않습니다. Slack 로그인 최초 성공 시 가입과 로그인을 통합하는 방향입니다.
- 현재 데이터는 프론트엔드 mock data이며, 추후 FastAPI API 응답으로 교체할 예정입니다.

## 주요 명령어

```bash
npm run dev
npm run build
npm run lint
npm run preview
```
