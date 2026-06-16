# Agent Docs

이 폴더는 JungleLog를 구현하면서 계속 참고하는 작업 운영 문서 폴더다.

## 문서 역할

| 파일 | 역할 |
| --- | --- |
| [code.md](code.md) | 구현 전에 확인해야 하는 코드 컨벤션 |
| [wei.md](wei.md) | AI 구현 기준 문서. RAG, MCP, Agent를 JungleLog 기준으로 어떻게 설계할지 정리 |
| [api-design.md](api-design.md) | 프론트와 백엔드가 공유하는 API 계약 |
| [db-design.md](db-design.md) | ERD, DBML, 테이블/필드/관계 설명 |
| [setup.md](setup.md) | 로컬 개발 환경 세팅 명령어와 실행 방법 |
| [log.md](log.md) | 전체 진행 상황, 작업 로그, 다음 단계 기록 |
| [study.md](study.md) | 구현을 이해하기 위한 학습 내용 |
| [test.md](test.md) | 구현 후 반복 실행하는 자체 QA 체크리스트 |
| [troubleshooting.md](troubleshooting.md) | QA 중 발견한 실제 문제와 해결 과정 |
| [front-keyword.md](front-keyword.md) | 프론트엔드 학습 키워드와 코드 연결 |
| [back-keyword.md](back-keyword.md) | 백엔드 학습 키워드와 코드 연결 |
| [rag.md](rag.md) | RAG 구현 세부 학습 문서 |
| [mcp.md](mcp.md) | MCP 구현 세부 학습 문서 |
| [ai-agent.md](ai-agent.md) | AI Agent 구현 세부 학습 문서 |
| [ai.md](ai.md) | OpenAI API 연결 학습 문서 |

## 진행 규칙

1. 구현 전에 [code.md](code.md)를 먼저 확인한다.
2. AI 기능을 구현할 때는 [wei.md](wei.md)를 먼저 확인한다.
3. 현재 단계와 다음 작업은 [log.md](log.md)를 기준으로 확인한다.
4. 환경 세팅이나 실행 명령은 [setup.md](setup.md)에 기록한다.
5. DB 설계 변경은 [db-design.md](db-design.md)에 반영한다.
6. API 추가/변경은 [api-design.md](api-design.md)에 반영한다.
7. 구현을 이해하기 위한 개념은 [study.md](study.md)에 정리한다.
8. 새로 배운 키워드는 [front-keyword.md](front-keyword.md) 또는 [back-keyword.md](back-keyword.md)에 연결한다.
9. 구현 후 [test.md](test.md)의 관련 QA를 직접 확인한다.
10. QA 중 실제 문제가 나오면 [troubleshooting.md](troubleshooting.md)에 원인과 해결을 남긴다.
11. 작업 단위가 끝나면 README, log, study, test를 함께 업데이트한다.
12. 커밋 가능한 단위가 끝나면 커밋 제목을 제안하고 커밋한다.

## 현재 큰 단계

- React mock UI: 완료
- FastAPI/PostgreSQL 기본 API: 완료
- Google OAuth/JWT/권한: 완료
- 게시글/댓글/내 기록: 완료
- 포트폴리오/GitHub API/코치 리뷰: 완료
- AI 전 GitHub 참고 자료 준비: 완료
- OpenAI 기본 생성: 구현
- RAG 최소 indexing/search API: 구현
- MCP JSON-RPC tool endpoint: 구현
- Agent 최소 tool loop: 구현

## AI 구현 시 기준

AI 단계에서는 아래 순서로 진행한다.

1. OpenAI 단일 호출로 포트폴리오 글/면접 질문 생성: 완료
2. RAG 문서 저장과 embedding 검색: 완료
3. GitHub MCP tool 또는 MCP-like tool 구현: 완료
4. Agent loop로 RAG와 MCP tool을 선택 실행: 완료
5. 실제 AI 호출 QA와 제출 문서/스크린샷 정리: 남음

핵심 문장:

```txt
RAG는 검색, MCP는 연결, Agent는 루프다.
```
