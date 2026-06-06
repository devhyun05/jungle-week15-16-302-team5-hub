# Backend

FastAPI로 말랑 연구소의 게시판 API와 AI 기능을 구현한다.

## 구현할 API 영역

- Auth: 회원가입, 로그인, 현재 사용자 조회
- Posts: 게시글 CRUD, 검색, 페이징
- Comments: 댓글 CRUD
- Tags: 태그 목록, 태그 필터
- AI: RAG 검색, MCP 호출, 말랑 진단 에이전트

## 구현할 서비스

- `auth_service`: 비밀번호 해시, JWT 발급/검증
- `post_service`: 게시글 유형별 저장과 조회
- `embedding_service`: 게시글/댓글 임베딩 생성
- `rag_service`: pgvector 유사도 검색
- `mcp_client`: MCP Server JSON-RPC 호출
- `agent_service`: RAG와 MCP를 조합한 진단 흐름
