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

- `README.md`: 프로젝트 소개, 기술 스택, 실행 계획, 데모 시나리오를 정리한다.
- `.env.example`: 로컬 실행에 필요한 환경 변수 이름을 기록한다.
- `.gitignore`: GitHub에 올리지 않을 파일을 정의한다.

## frontend

React로 사용자 화면을 구현한다.

- `src/main.jsx`: React 앱 진입점.
- `src/App.jsx`: 전체 라우팅과 공통 레이아웃을 연결.
- `src/api/`: FastAPI 호출 함수 모음.
- `src/components/`: 여러 화면에서 재사용할 UI 컴포넌트.
- `src/pages/`: 페이지 단위 화면.
- `src/styles/global.css`: 전역 스타일.

## backend

FastAPI로 게시판 API와 AI 기능을 구현한다.

- `app/main.py`: FastAPI 앱 생성, 라우터 연결, 헬스체크.
- `app/core/config.py`: 환경 변수와 설정 관리.
- `app/db/`: DB 연결, 세션, 모델 등록.
- `app/models/`: SQLAlchemy 모델.
- `app/schemas/`: Pydantic 요청/응답 스키마.
- `app/routers/`: API endpoint.
- `app/services/`: 인증, 게시글, RAG, MCP Client, Agent 비즈니스 로직.
- `app/seed.py`: 개발용 샘플 데이터 입력.

## mcp_server

FastAPI 본 서버와 분리된 MCP 도구 서버를 구현한다.

- `app/main.py`: JSON-RPC 요청 endpoint.
- `app/jsonrpc.py`: JSON-RPC 요청/응답 처리.
- `app/tools/weather.py`: 날씨/습도 API 호출 도구.

## db

- `init.sql`: PostgreSQL과 pgvector를 초기화하고 주요 테이블을 설계할 때 참고한다.

## 구현 순서

1. Backend DB 모델과 API skeleton 작성
2. Frontend 화면 skeleton과 API 연결
3. 기본 게시판 기능 완성
4. RAG embedding과 pgvector 검색 추가
5. MCP Server와 습도 API 연결
6. Agent가 RAG/MCP를 조합하도록 구현
