# Agent Docs

이 폴더는 JungleLog를 구현하면서 계속 참고하는 작업 운영 문서 폴더다.
Trello는 진행판으로 사용하고, 이 폴더는 저장소 안에 남는 기준 문서로 사용한다.

## 문서 역할

| 파일 | 역할 |
| --- | --- |
| [code.md](code.md) | 구현 전 반드시 확인할 코드 컨벤션 |
| [log.md](log.md) | 전체 단계, 현재 진행 상황, 다음 단계 기록 |
| [setup.md](setup.md) | 로컬 개발 환경 세팅 명령어와 실행 방법 기록 |
| [db-design.md](db-design.md) | ERD, DBML, 테이블 관계 설계 기록 |
| [study.md](study.md) | 구현을 이해하기 위한 학습 기록 |
| [test.md](test.md) | 구현 후 반복 실행하는 자체 QA 체크리스트 |
| [troubleshooting.md](troubleshooting.md) | QA 중 발견한 실제 문제와 해결 과정 기록 |
| [front-keyword.md](front-keyword.md) | 프론트엔드 구현 키워드와 코드 연결 기록 |
| [back-keyword.md](back-keyword.md) | 백엔드/Trello 공용 키워드와 구현 연결 기록 |

## 진행 규칙

1. 구현 전 [code.md](code.md)를 먼저 확인한다.
2. 현재 단계가 끝났는지 [log.md](log.md)의 완료 기준으로 확인한다.
3. 세팅 명령어, 실행 방법, 설치 패키지는 [setup.md](setup.md)에 기록한다.
4. DB 설계 변경은 [db-design.md](db-design.md)에 DBML과 함께 기록한다.
5. 구현 또는 계획이 바뀌면 [log.md](log.md)를 업데이트한다.
6. 학습한 개념이나 코드 흐름은 [study.md](study.md)에 정리한다.
7. 구현 중 등장한 키워드는 [front-keyword.md](front-keyword.md) 또는 [back-keyword.md](back-keyword.md)에 연결해서 정리한다.
8. 구현 후 [test.md](test.md)의 관련 QA 체크리스트를 직접 돌린다.
9. QA 중 실제 문제가 발견되면 [troubleshooting.md](troubleshooting.md)에 원인과 해결을 기록한다.
10. 사용자에게 "다음 거 가보자"라는 요청이 오면 현재 단계 검증 후 다음 단계로 넘어간다.
11. 구현 단위가 끝나면 커밋해도 되는 시점인지 알려주고, 추천 커밋 제목을 함께 제안한다.
12. 코드를 작성할 때는 초보자가 흐름을 따라갈 수 있도록 함수 역할, 데이터 흐름, 설계 의도를 주석으로 남긴다.
13. 단, 주석은 학습을 돕는 목적이며 나중에 익숙해지면 지나치게 당연한 주석은 정리할 수 있다.
14. 구현 완료 보고에는 검증 결과, 수정한 문서, 다음 학습/구현 순서를 함께 포함한다.

## 현재 단계

- 0단계 프로젝트 환경 세팅 및 문서 기준 정리: 완료
- 1단계 React mock UI 안정화: 완료
- 2단계 React 코드 이해 및 학습 정리: 완료
- 3단계 FastAPI 백엔드 기본 구조 구현: 완료
- 4단계 PostgreSQL DB 설계 및 연결: 완료
- 4.5단계 ERD v1 12개 SQLAlchemy 모델 반영: 완료
- 5단계 게시글/댓글 API 구현: 예정
