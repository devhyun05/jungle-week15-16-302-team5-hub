# Project Structure

이 문서는 JungleLog의 현재 폴더 역할과 앞으로 파일을 추가할 위치를 정리한다.

## Root

```txt
WEEK15_AI_BOARD/
  backend/             FastAPI 서버 코드
  frontend/            React 클라이언트 코드
  docs/                과제 문서, 구조 정리, 구현 범위 기록
  docker-compose.yml   로컬 PostgreSQL 개발 인프라
  README.md            프로젝트 개요
```

## Frontend

```txt
frontend/
  src/
    app/
      api/             백엔드 API 호출 함수 위치
      components/      공통 UI 컴포넌트
      contexts/        로그인 사용자, role 등 전역 상태
      data/            mock data와 임시 fixture
      hooks/           재사용 React hook
      layouts/         AuthLayout, MainLayout
      pages/           라우트 화면
        ai/            AI 도우미 화면
        auth/          로그인, 회원가입
        coach/         코치 리뷰 요청/인박스 화면
        dashboard/     학생/코치 대시보드
        portfolio/     포트폴리오 관리
        posts/         게시글 목록, 상세, 작성, 내 기록
        settings/      설정
      types/           프론트 전용 공통 타입
      App.tsx
      routes.tsx
    styles/            전역 스타일, 테마
```

## Backend

```txt
backend/
  app/
    core/              설정, 보안, 예외 처리
    db/                DB 세션, Base, 모델
    repositories/      DB 접근 계층
    routers/           FastAPI 라우터
    schemas/           Pydantic 요청/응답 스키마
    services/          비즈니스 로직, AI/RAG/MCP 서비스
    utils/             공통 유틸
    main.py
```

## Frontend File Placement Rules

- 새 라우트 화면은 `frontend/src/app/pages/{domain}/`에 둔다.
- 여러 화면에서 쓰는 UI는 `frontend/src/app/components/`에 둔다.
- 백엔드 호출 함수는 `frontend/src/app/api/`에 둔다.
- 여러 컴포넌트에서 쓰는 타입은 `frontend/src/app/types/`에 둔다.
- 현재 mock data는 `frontend/src/app/data/mockData.ts`에 둔다.
- 실제 API 연결 후에는 mock data를 API 응답으로 점진적으로 교체한다.

## Current Boundary

지금은 React mock UI 단계다. 따라서 화면 상태는 `useState`와 mock data로만 유지된다.
실제 DB 저장, 인증, GitHub API, OpenAI/RAG/MCP/Agent 호출은 백엔드 연결 후 구현한다.
