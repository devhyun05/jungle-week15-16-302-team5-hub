# JungleLog QA 체크리스트

이 문서는 구현 후 반복해서 확인할 QA 기준이다. 문제가 생기면 `troubleshooting.md`에 원인과 해결을 따로 기록한다.

## 공통 실행 체크

- [ ] PostgreSQL Docker container가 실행 중이다.
- [ ] backend 서버가 실행 중이다.
- [ ] frontend Vite 서버가 실행 중이다.
- [ ] `npm run build`가 성공한다.
- [ ] backend compile이 성공한다.
- [ ] 브라우저 console error가 없다.
- [ ] 문서에 물음표로 깨진 한글 또는 깨진 문자이 없다.

문서 손상 확인:

```powershell
rg -n "\?\?\?" README.md docs
```

## 인증/권한 QA

### 비로그인

- [ ] `/login`이 열린다.
- [ ] Google 로그인 버튼이 보인다.
- [ ] 보호 화면 접근 시 `/login`으로 이동한다.

### 승인 대기 사용자

- [ ] 로그인 후 승인 대기 상태면 `/pending-approval`로 이동한다.
- [ ] 학생/코치/관리자 화면에 접근할 수 없다.

### STUDENT

- [ ] 학생 메뉴만 보인다.
- [ ] 대시보드, 전체 게시글, 내 기록, 포트폴리오 관리, AI 도우미, 코치 리뷰 요청에 접근 가능하다.
- [ ] 관리자 화면 접근 시 제한 안내가 보인다.
- [ ] 코치 전용 인박스 접근 시 제한 안내가 보인다.

### COACH

- [ ] 코치 리뷰 인박스와 전체 게시글 중심 메뉴가 보인다.
- [ ] 학생 전용 포트폴리오 관리 화면에 접근할 수 없다.
- [ ] 관리자 화면에 접근할 수 없다.

### ADMIN

- [ ] 관리자 사용자 승인 화면에 접근 가능하다.
- [ ] 학생/코치 역할 승인이 가능하다.
- [ ] `.env`의 `ADMIN_EMAILS` 최고관리자는 role/status 변경이 불가능하다.
- [ ] 최고관리자 배지가 표시된다.

## 게시글 QA

### 목록

- [ ] `GET /posts`가 200을 반환한다.
- [ ] 공개 게시글만 전체 게시글 목록에 보인다.
- [ ] category query로 필터링된다.
- [ ] keyword query로 검색된다.
- [ ] paging이 동작한다.

### 상세

- [ ] `/posts/{id}`가 id에 맞는 글을 보여준다.
- [ ] 없는 id는 404 안내를 보여준다.
- [ ] 비공개 글은 작성자 또는 ADMIN만 볼 수 있다.

### 작성

- [ ] STUDENT가 게시글을 작성할 수 있다.
- [ ] COACH는 게시글 작성이 제한된다.
- [ ] 빈 제목/본문은 validation 안내가 나온다.
- [ ] 작성 성공 후 상세 또는 목록으로 이동한다.

### 수정

- [ ] 작성자는 자신의 글을 수정할 수 있다.
- [ ] ADMIN은 글을 수정할 수 있다.
- [ ] 다른 STUDENT는 수정할 수 없다.

### 삭제

- [ ] 삭제 버튼 클릭 시 confirm modal이 뜬다.
- [ ] 확인하면 soft delete 처리된다.
- [ ] 삭제 후 목록과 상세에서 보이지 않는다.

## 댓글 QA

- [ ] 게시글 상세에서 댓글 목록이 보인다.
- [ ] 로그인 사용자는 댓글을 작성할 수 있다.
- [ ] 작성 후 댓글 목록에 바로 반영된다.
- [ ] 댓글 작성자는 자신의 댓글을 삭제할 수 있다.
- [ ] ADMIN은 댓글을 삭제할 수 있다.
- [ ] 삭제된 댓글은 목록에서 보이지 않는다.

## 내 기록 QA

- [ ] `/me/posts`가 현재 사용자 글만 반환한다.
- [ ] 공개/비공개 필터가 동작한다.
- [ ] 카테고리 필터가 동작한다.
- [ ] 검색이 동작한다.
- [ ] 포트폴리오 관리 카테고리 게시글도 내 기록에서 확인 가능하다.

## 관리자 사용자 승인 QA

- [ ] 승인 대기 사용자 수가 맞다.
- [ ] 승인 완료 사용자 수가 맞다.
- [ ] 승인 완료 학생 수가 맞다.
- [ ] 승인 완료 코치 수가 맞다.
- [ ] 이름/이메일/역할 검색이 동작한다.
- [ ] 승인 상태 필터가 동작한다.
- [ ] 역할 변경 후 새로고침해도 DB 상태가 유지된다.
- [ ] 승인 이력이 `user_approval_logs`에 남는다.
- [ ] 처리/담당 표시가 `· 처리`, `· 담당`처럼 깨지지 않는다.

## 포트폴리오 프로젝트 QA

### 등록

- [ ] GitHub repo URL로 프로젝트를 등록할 수 있다.
- [ ] GitHub branch URL로 프로젝트를 등록할 수 있다.
- [ ] 같은 repo/branch 중복 등록이 막힌다.
- [ ] repo 링크와 branch 링크 클릭 영역이 분리되어 있다.

### 프로젝트 목록

- [ ] 프로젝트 검색이 동작한다.
- [ ] 포트폴리오 상태 필터가 동작한다.
- [ ] 코치 리뷰 상태 필터가 동작한다.
- [ ] 프로젝트 카드에 포트폴리오 상태와 코치 피드백 상태가 보인다.

### 상세 레이아웃

- [ ] 왼쪽 큰 영역에 포트폴리오 글이 보인다.
- [ ] 오른쪽 보조 영역에 면접 질문, 코치 리뷰, GitHub 참고 정보, 연결된 학습 기록이 보인다.
- [ ] 화면이 너무 좁거나 깨지지 않는다.

### 기록 연결

- [ ] 기록 연결하기 modal이 열린다.
- [ ] 내 기록 목록에서 연결할 글을 선택할 수 있다.
- [ ] 포트폴리오 관리 카테고리 게시글은 연결 대상으로 제외된다.
- [ ] 연결 완료 후 화면에 연결된 학습 기록이 보인다.

### GitHub 참고 자료

- [ ] README preview가 보인다.
- [ ] README는 AI 참고 자료라는 설명으로 보인다.
- [ ] 커밋 메시지 일부가 보인다.
- [ ] 전체 커밋 메시지 보기 modal 또는 접힘 영역이 동작한다.
- [ ] 화면에는 일부만 보이고 AI/RAG 단계에서는 전체를 참고한다는 설명이 있다.

### 포트폴리오 게시글 발행

- [ ] 발행 버튼 클릭 시 공개/비공개 선택 modal이 뜬다.
- [ ] 공개로 발행하면 전체 게시글에 보인다.
- [ ] 비공개로 발행하면 내 기록에는 보이고 전체 게시글에는 보이지 않는다.
- [ ] 처음 발행은 `포트폴리오 게시글을 발행했습니다.` toast가 뜬다.
- [ ] 내용 변경 후 재발행은 `최신 내용으로 갱신했습니다.` toast가 뜬다.
- [ ] 같은 내용 재발행은 `이미 최신 포트폴리오 게시글입니다.` toast가 뜬다.
- [ ] 중복 게시글이 생기지 않는다.
- [ ] 제목에 `[포트폴리오]` prefix가 보이지 않는다.

## 포트폴리오 게시글 상세 QA

- [ ] 일반 게시글 상세와 포트폴리오 게시글 상세가 구분된다.
- [ ] 포트폴리오 게시글은 전용 섹션 UI로 보인다.
- [ ] Markdown 기호 `##`, `###`, `-`가 그대로 난잡하게 보이지 않는다.
- [ ] 프로젝트 개요, GitHub 정보, 기술 스택, 연결된 학습 기록, 커밋 요약, 코치 피드백 상태, 포트폴리오 글이 구분되어 보인다.

## 코치 리뷰 QA

### 학생

- [ ] 코치 리뷰 요청 화면에서 게시글/포트폴리오를 선택할 수 있다.
- [ ] 코치를 선택할 수 있다.
- [ ] 요청 메시지를 입력할 수 있다.
- [ ] 요청 생성 후 내가 보낸 요청 목록에 보인다.
- [ ] 대기 중 요청은 취소할 수 있다.
- [ ] 검토 중/수정 요청/피드백 완료 요청은 취소할 수 없다.
- [ ] 코치가 보낸 피드백과 상태가 요청 현황에 표시된다.

### 코치

- [ ] 코치 인박스에서 자신에게 온 요청만 보인다.
- [ ] 검색이 동작한다.
- [ ] 상태 필터에서 `최종 확인`은 보이지 않는다.
- [ ] 상태 선택은 검토 중, 수정 요청, 피드백 완료만 가능하다.
- [ ] 피드백 작성 후 전송 버튼으로 상태와 피드백을 함께 보낸다.
- [ ] 전송 성공 안내는 toast로 뜬다.
- [ ] 원문 보기에서 댓글 영역은 `댓글`로만 표시된다.

## 알림 QA

- [ ] 알림 아이콘 클릭 시 popover가 열린다.
- [ ] 코치 피드백 알림이 표시된다.
- [ ] AI 초안 생성 완료 mock/예정 알림 문구가 깨지지 않는다.
- [ ] 읽음 처리가 동작한다.

## GitHub API QA

- [ ] public repo 등록이 성공한다.
- [ ] branch URL 등록이 성공한다.
- [ ] README 원문이 DB에 저장된다.
- [ ] languages가 기술 스택으로 반영된다.
- [ ] commit message가 `github_commits`에 저장된다.
- [ ] commits API pagination이 page를 넘기며 수집한다.
- [ ] 빈 페이지 또는 100개 미만 응답에서 반복이 종료된다.
- [ ] GitHub API 실패 시 사용자에게 이해 가능한 오류가 보인다.

## AI 전 준비 QA

- [ ] README 원문 전체가 저장되어 있다.
- [ ] 수집된 전체 커밋 메시지가 저장되어 있다.
- [ ] 연결된 학습 기록이 저장되어 있다.
- [ ] AI 도우미 참고자료 패널에서 README/커밋 원문 사용 기준이 설명된다.
- [ ] 아직 OpenAI/RAG/MCP/Agent 실제 호출은 하지 않는다.

## 문서 QA

- [ ] `README.md`에 현재 구현 상태가 반영되어 있다.
- [ ] `docs/agent/log.md`에 작업 로그가 있다.
- [ ] `docs/agent/study.md`에 학습 개념이 있다.
- [ ] `docs/agent/test.md`에 QA 체크리스트가 있다.
- [ ] `docs/agent/troubleshooting.md`에 문제 해결 기록이 있다.
- [ ] `docs/agent/api-design.md`에 API 계약이 있다.
- [ ] `docs/agent/back-keyword.md`에 백엔드 키워드가 있다.


## 2026-06-16 QA: 포트폴리오 관리 UI 정리

### 확인할 것

- `/portfolio` 진입 시 console error가 없어야 한다.
- `코치 리뷰 상태` 필터가 segmented control처럼 보여야 한다.
- `전체`, `요청 전`, `요청함`, `검토 중`, `수정 요청`, `피드백 완료`를 눌렀을 때 프로젝트 필터링이 기존처럼 동작해야 한다.
- GitHub 참고 정보가 기술 스택 / 커밋 참고 / 최근 커밋 preview / README 참고로 세로 구분되어 보여야 한다.
- `수집된 커밋 n개 보기` 버튼은 커밋 모달을 열어야 한다.
- `GitHub 커밋 보기`, `GitHub README 보기` 링크는 기존처럼 새 탭 링크를 유지해야 한다.

### 자동 검증

- `frontend`: `npm run build`
- `backend`: `.venv\Scripts\python.exe -m compileall app`

## 2026-06-16 QA: 포트폴리오 dropdown 필터와 3단 상세

### 확인할 것

- `/portfolio`에서 코치 리뷰 상태 필터가 select/dropdown으로 보인다.
- dropdown 항목은 `전체`, `요청 전`, `요청 대기 중`, `검토 중`, `수정 요청`, `피드백 완료`로 보인다.
- `요청 대기 중`을 선택해도 내부 필터는 기존 `요청함` 값 기준으로 동작한다.
- 선택 프로젝트 상세가 큰 화면에서 포트폴리오 글 / 면접 질문·코치 리뷰·연결 기록 / GitHub 참고 정보 3단으로 보인다.
- GitHub 참고 정보는 오른쪽 column에서 기술 스택 / 커밋 참고 / 최근 커밋 preview / README 참고로 세로 구분된다.
- `수집된 커밋 n개 보기`, `GitHub 커밋 보기`, `GitHub README 보기` 동작은 기존과 같아야 한다.

### 자동 검증

- `frontend`: `npm run build` 성공
- `backend`: `.venv\\Scripts\\python.exe -m compileall app` 성공

### 브라우저 확인 결과

- 관리자 계정으로 `/portfolio` 진입 시 console error 없음.
- 프로젝트가 0개인 상태에서도 코치 리뷰 상태 dropdown이 보이고 `요청 대기 중` label이 표시됨.
- 현재 관리자 세션에는 포트폴리오 프로젝트가 없어 GitHub 참고 정보 3단 column은 실제 데이터 화면에서 추가 확인이 필요함.

## 2026-06-16 QA: 포트폴리오 보조 정보 column

### 확인할 것

- 코치 리뷰/피드백 설명이 제목 바로 아래에 붙어 보이지 않고 본문 박스 안에 정리되어야 한다.
- 연결된 학습 기록 카드에서 카테고리/날짜/제목/요약이 한 묶음으로 들여쓰기되어 보여야 한다.
- 연결된 학습 기록 제목이나 요약이 길어도 카드 바깥으로 튀어나오지 않아야 한다.
- 가운데 column의 면접 질문, 코치 리뷰, 연결 기록 섹션 간격이 비슷해야 한다.

## 2026-06-16 QA: 포트폴리오 보조 카드 header

### 확인할 것

- `코치 리뷰/피드백`이 `코치 리뷰/피드`와 `백`처럼 쪼개져 보이지 않아야 한다.
- `연결된 학습 기록`이 두 줄로 어색하게 끊기지 않아야 한다.
- 코치 리뷰 요청 버튼과 기록 연결하기 버튼은 제목을 밀어내지 않고 아래쪽/right에 정돈되어 보여야 한다.
- 연결된 학습 기록 카드의 내부 들여쓰기는 유지되어야 한다.

## 2026-06-16 QA: GitHub 액션 버튼 순서

### 확인할 것

- 포트폴리오 상세 상단 액션 영역에서 `GitHub 정보 새로고침`이 `GitHub 보기` 왼쪽에 보여야 한다.
- `GitHub 보기` 링크와 `GitHub 정보 새로고침` 동작은 기존과 같아야 한다.

## 2026-06-16 QA: 포트폴리오 액션 버튼 그룹

### 확인할 것

- `GitHub 정보 새로고침`과 `GitHub 보기`가 같은 흰색 버튼 그룹으로 정렬되어 보여야 한다.
- 포트폴리오 게시글 발행/게시글 보러가기 버튼은 별도 초록 버튼 그룹으로 보여야 한다.
- 버튼 클릭 동작은 기존과 같아야 한다.

## 2026-06-16 QA: 포트폴리오 액션 버튼 2줄 정렬

### 확인할 것

- 첫 줄에 `포트폴리오 게시글로 발행`, `게시글 보러가기`가 보여야 한다.
- 둘째 줄에 `GitHub 정보 새로고침`, `GitHub 보기`가 보여야 한다.
- 버튼 그룹이 좌우로 과하게 벌어져 보이지 않아야 한다.

## 2026-06-16 QA: OpenAI 기본 연결

### 확인할 것

- `backend/.env`에 `OPENAI_API_KEY`가 없으면 `/ai/generate`는 400을 반환해야 한다.
- `OPENAI_API_KEY`가 있으면 선택 프로젝트 기준으로 포트폴리오 글 또는 면접 질문이 생성되어야 한다.
- STUDENT와 ADMIN만 `/ai/generate`를 호출할 수 있어야 한다.
- 다른 사용자의 프로젝트 id를 요청하면 404 또는 권한 제한 결과가 나와야 한다.
- OpenAI API key는 프론트엔드로 절대 전달되지 않아야 한다.

### 자동 검증

- `backend`: `.venv\\Scripts\\python.exe -m compileall app`
- `frontend`: `npm run build`

### 수동 검증 예정

- `backend/.env`에 `OPENAI_API_KEY` 추가 후 Swagger에서 `POST /ai/generate` 호출
- 이후 AI 도우미 화면에서 실제 API 연결 확인

## 2026-06-17 QA: AI 도우미 프론트 API 연결

### 확인할 것

- `/ai-assistant`에서 `OpenAI로 생성하기` 버튼이 보인다.
- 버튼을 누르면 프론트가 `POST /ai/generate`를 호출한다.
- 프로젝트 선택을 바꾸면 이전 생성 결과가 남아 있지 않아야 한다.
- `포트폴리오 글`과 `면접 예상 질문` 유형을 바꾸면 이전 생성 결과가 초기화되어야 한다.
- API 호출 성공 시 생성 결과가 오른쪽 결과 영역에 표시되어야 한다.
- API 호출 실패 시 toast와 오류 메시지로 원인을 확인할 수 있어야 한다.
- `OpenAI로 생성하기` 버튼은 생성 중 중복 클릭되지 않아야 한다.
- 화면 진입만으로 OpenAI API가 자동 호출되면 안 된다.

### 자동 검증

```txt
frontend npm run build: success
backend .venv\Scripts\python.exe -m compileall app: success
backend app import: success
```

### 현재 막힌 점

- `backend/.env`에 `OPENAI_API_KEY` 변수명은 있으나 값이 비어 있다.
- 실제 OpenAI 생성 QA는 키 값을 넣은 뒤 다시 진행해야 한다.

## 2026-06-17 QA 결과: OpenAI 실제 호출

### 확인한 것

- `OPENAI_API_KEY` 값이 들어간 것을 비밀값 출력 없이 길이로만 확인했다.
- 백엔드 서버 재시작 전에는 `/ai/generate`가 `404 Not Found`였다.
- 서버 재시작 후 OpenAPI 문서에 `/ai/generate`가 등록됐다.
- JWT access token cookie를 직접 만들어 실제 HTTP endpoint를 호출했다.
- `project_id=25`, `output_type=interview` 요청이 `200 OK`로 성공했다.
- 응답에는 `project_id`, `output_type`, `model`, `content`가 포함됐다.

### 아직 남은 수동 QA

- 현재 브라우저 로그인 계정은 관리자이고, 관리자 계정에는 포트폴리오 프로젝트가 없다.
- `/ai-assistant` 화면에서 실제 버튼을 눌러 생성하려면 프로젝트 소유자인 `leejunhee2796@gmail.com` 계정으로 로그인하거나, 현재 관리자 계정에 테스트 프로젝트를 등록해야 한다.
- 학생 계정에서 `/ai-assistant` → 프로젝트 선택 → `OpenAI로 생성하기` → 결과 저장까지 브라우저 기준으로 확인해야 한다.

### 주의할 점

- OpenAI 실제 호출은 API 사용량이 발생한다.
- 개발 중에는 짧은 유형인 `interview`로 먼저 검증하고, 포트폴리오 본문 생성은 필요할 때 호출한다.

## 2026-06-17 QA: GitHub 참고 자료 UI 정리

### 확인할 것

- 포트폴리오 관리 화면의 GitHub 참고 정보에서 `수집된 커밋 n개 보기` 버튼이 보이지 않아야 한다.
- GitHub 커밋 메시지 참고 자료에는 `GitHub 커밋 보기` 버튼만 남아야 한다.
- 커밋 참고 설명은 제목 아래로 들여쓰기되어 보여야 한다.
- GitHub README 참고 자료의 설명, 저장 상태 배지, README 요약도 제목 아래로 들여쓰기되어 보여야 한다.
- 포트폴리오 게시글 상세의 최근 커밋 요약 섹션에서 `전체 커밋 메시지 보기` 접힘 영역이 보이지 않아야 한다.
- 최근 커밋 요약과 `GitHub 커밋 보기` 링크는 기존처럼 보여야 한다.
- AI 도우미 참고 자료 영역에서도 README/커밋 설명이 들여쓰기되어 보여야 한다.

### 자동 검증

```txt
rg "수집된 커밋 ... 보기|전체 커밋 메시지 보기|setIsCommitDialogOpen|isCommitDialogOpen|allCommitMessages": no result
frontend npm run build: success
backend compileall app: success
```

### 남은 수동 확인

- 프로젝트가 있는 학생 계정으로 `/portfolio`와 포트폴리오 게시글 상세에 들어가 실제 시각 정렬을 확인한다.

## 2026-06-17 QA: AI 생성 결과 저장 API 흐름

### 자동/API 검증 결과

- 학생 계정 `leejunhee2796@gmail.com` 기준 JWT cookie로 API를 호출했다.
- 프로젝트 목록 조회가 성공했다.
- `POST /ai/generate`가 성공했고 OpenAI 응답이 반환됐다.
- 생성된 면접 예상 질문을 포트폴리오 프로젝트에 저장했다.
- 프로젝트를 다시 조회했을 때 `aiInterviewSaved=true`와 저장된 본문 길이를 확인했다.

```txt
GET /portfolio/projects: 200
POST /ai/generate: 200
PATCH /portfolio/projects/{id}: 200
GET /portfolio/projects: 200
aiInterviewSaved: True
```

### 남은 브라우저 QA

- 프로젝트 소유 학생 계정으로 로그인한다.
- `/ai-assistant`에서 프로젝트 선택 dropdown이 보이는지 확인한다.
- `OpenAI로 생성하기` 버튼 클릭 후 결과 영역에 생성 결과가 표시되는지 확인한다.
- 저장 버튼 클릭 후 `/portfolio`에서 면접 질문 저장 상태가 `저장됨`으로 보이는지 확인한다.
- 저장 후에도 포트폴리오 글/면접 질문 값이 다른 프로젝트와 섞이지 않는지 확인한다.

## 2026-06-17 QA: 포트폴리오 게시글 본문 파싱

### 확인한 것

- DB의 발행 게시글 62번 본문에 `## 포트폴리오 글` 섹션이 있고, 섹션 내용 길이가 2122자인 것을 확인했다.
- `/posts/62` 브라우저 확인 결과 `아직 작성된 포트폴리오 글이 없습니다.` 문구가 사라졌다.
- `/posts/62` 브라우저 확인 결과 `JungleLog 프로젝트 경험`, `프로젝트 개요 및 문제 정의`가 보인다.
- `npm run build`가 성공했다.
- 백엔드 compileall이 성공했다.

### 추가 수동 확인

- 프로젝트 소유 학생 계정으로 `/portfolio`에 들어간다.
- 포트폴리오 글 영역이 12줄 preview로 보이는지 확인한다.
- `전체 포트폴리오 글 보기` 버튼을 누르면 modal이 열리는지 확인한다.
- modal 안에서 전체 포트폴리오 글이 스크롤로 읽히는지 확인한다.

## 2026-06-17 QA: 포트폴리오 Markdown 렌더링

### 확인한 것

- 포트폴리오 게시글 상세에서 `# JungleLog`, `## 프로젝트` 같은 Markdown heading marker가 그대로 보이지 않는다.
- `---` 구분선 marker가 그대로 보이지 않는다.
- `JungleLog 프로젝트 경험` 제목이 화면에 보인다.
- `나의 역할 및 참여도` 섹션이 화면에 보인다.
- `트러블슈팅 및 도전 과제` 섹션이 화면에 보인다.
- placeholder 문구 `아직 작성된 포트폴리오 글이 없습니다.`가 보이지 않는다.
- `npm run build`가 성공했다.
- 백엔드 compileall이 성공했다.

### 자동/브라우저 검증 결과

```txt
hasHashHeadingMarker: false
hasDividerMarker: false
hasPlaceholder: false
hasPortfolioTitle: true
hasRoleSection: true
hasTroubleSection: true
frontend npm run build: success
backend compileall app: success
```

### 남은 수동 확인

- 프로젝트 소유 학생 계정으로 `/portfolio`에 들어간다.
- `전체 포트폴리오 글 보기` 모달에서 같은 Markdown 렌더링이 적용되는지 눈으로 확인한다.

### 추가 확인할 것

- `### 제목`으로 시작하는 AI 결과도 대표 제목 카드로 보이는지 확인한다.
- Markdown heading 없이 첫 줄이 제목처럼 시작하는 AI 결과도 대표 제목 카드로 보이는지 확인한다.
- 포트폴리오 관리 화면 미리보기에서 raw Markdown 기호가 과하게 드러나지 않아야 한다.
- 미리보기는 너무 길게 펼쳐지지 않고, 전체 내용은 `전체 포트폴리오 글 보기` 모달에서 확인되어야 한다.

## 2026-06-17 QA: 포트폴리오 문서형 상세 UI 보강

### 자동 검증 결과

```txt
frontend npm run build: success
backend compileall app: success
```

### 수동 확인할 것

- `/portfolio`에서 포트폴리오 글 preview에 `####` 같은 Markdown 기호가 그대로 보이지 않는지 확인한다.
- `/portfolio`에서 `전체 포트폴리오 글 보기` 모달이 구조화된 제목/목록 형태로 보이는지 확인한다.
- `/portfolio`에서 면접 예상 질문이 저장된 프로젝트는 `전체 예상 질문 보기` 버튼이 보이는지 확인한다.
- `/portfolio`에서 코치 피드백이 있는 프로젝트는 `전체 피드백 보기` 버튼이 보이는지 확인한다.
- 포트폴리오 게시글로 다시 발행한 뒤 상세 화면에 `면접 예상 질문` 섹션이 보이는지 확인한다.
- 포트폴리오 게시글 상세가 일반 게시글보다 넓게 보이고, 프로젝트 개요 아래에 포트폴리오 글이 먼저 보이는지 확인한다.
- GitHub 정보, 기술 스택, 연결된 학습 기록, 최근 커밋 요약이 오른쪽 보조 column에 정리되어 보이는지 확인한다.

## 2026-06-17 QA: AI 도우미 저장값/면접 질문 표시 흐름

### 자동 검증 결과

```txt
frontend npm run build: success
backend compileall app: success
```

### 수동 확인할 것

- 저장된 포트폴리오 글이 없는 프로젝트로 `/ai-assistant?type=portfolio`에 들어갔을 때 sample 포트폴리오 글이 자동으로 보이지 않는지 확인한다.
- 저장된 면접 질문이 없는 프로젝트로 `/ai-assistant?type=interview`에 들어갔을 때 sample 면접 질문이 자동으로 보이지 않는지 확인한다.
- 저장된 결과가 있는 프로젝트는 AI 도우미 결과 영역에 저장된 내용이 보이는지 확인한다.
- `OpenAI로 생성하기`를 누르면 새 생성 결과가 결과 영역에 표시되는지 확인한다.
- 결과가 없을 때 저장 버튼이 비활성화되는지 확인한다.
- 포트폴리오 게시글 상세에서 면접 예상 질문 본문이 바로 펼쳐지지 않고 `면접 예상 질문 보기` 버튼으로 열리는지 확인한다.
- 면접 예상 질문 modal과 포트폴리오 관리 preview에서 `꼬리 질문` 문구가 보이지 않는지 확인한다.
- 포트폴리오 관리의 코치 리뷰/피드백 카드에서 `전체 피드백 보기` 버튼이 보이는지 확인한다.

## 2026-06-17 QA: 포트폴리오 프로젝트 삭제와 면접 질문 preview

### 자동 검증 결과

```txt
frontend npm run build: success
backend compileall app: success
from app.main import app: success
```

### 수동 확인할 것

- `/portfolio`에서 선택된 프로젝트 상세 상단에 `프로젝트 삭제` 버튼이 보이는지 확인한다.
- `프로젝트 삭제` 클릭 시 확인 modal이 열리는지 확인한다.
- 확인 modal에서 취소하면 프로젝트가 유지되는지 확인한다.
- 삭제 확인을 누르면 프로젝트가 목록에서 사라지는지 확인한다.
- 삭제 후 다음 프로젝트가 자연스럽게 선택되거나 프로젝트가 없다는 empty state가 보이는지 확인한다.
- 삭제한 프로젝트의 GitHub commit/연결 기록/리뷰 요청 데이터가 남아 화면 오류를 만들지 않는지 확인한다.
- 이미 발행된 포트폴리오 게시글은 삭제되지 않고 게시판 기록으로 남는지 확인한다.
- 포트폴리오 관리의 면접 질문 preview가 질문 3개 정도만 깔끔하게 보여주는지 확인한다.
- `전체 예상 질문 보기`를 누르면 전체 면접 질문 modal이 열리는지 확인한다.
- 포트폴리오 게시글 상세에서 `면접 예상 질문 보기` 버튼이 최근 커밋 요약 아래 오른쪽 보조 영역에 보이는지 확인한다.

### 추가 확인할 것

- 내 프로젝트 카드 오른쪽의 `X` 버튼을 누르면 프로젝트 삭제 확인 modal이 열리는지 확인한다.
- `X` 버튼을 눌렀을 때 카드 선택이 같이 바뀌지 않는지 확인한다.
- 삭제 확인을 눌렀을 때 `FAIL` 오류 없이 프로젝트가 사라지는지 확인한다.
- 삭제 후 백엔드 서버가 오래 켜져 있었다면 서버를 재시작한 뒤 다시 확인한다.
- 면접 예상 질문 전체보기 modal에서 질문은 굵고 크게, 답변은 `POINT` 영역 안에 묶여 보이는지 확인한다.
- 면접 예상 질문 preview에 질문 3개 요약이 보이고, 전체 답변 포인트가 preview 카드에 한꺼번에 펼쳐지지 않는지 확인한다.
- `전체 예상 질문 보기` modal에서 질문 여러 개가 하나의 카드에 몰리지 않고 질문별 카드로 나뉘는지 확인한다.
- 기존 저장 데이터가 `질문:`, `답변 포인트:`, `**질문**`, `- 답변 포인트:` 형식이어도 질문/POINT가 분리되는지 확인한다.

## 2026-06-17 QA: RAG/MCP/Agent 최소 기능

### 자동 검증 결과

```txt
frontend npm run build: success
backend compileall app: success
from app.main import app: success
registered routes: /ai/generate, /ai/rag/index, /ai/rag/search, /mcp, /ai/agent/run
```

### 비용 발생 때문에 자동 실행하지 않은 것

- `/ai/generate`
- `/ai/rag/index`
- `/ai/rag/search`
- `/ai/agent/run`

위 API는 OpenAI generation 또는 embedding 호출을 포함할 수 있으므로 사용자가 명시적으로 허락한 뒤 Swagger 또는 프론트에서 수동 QA한다.

### 수동 확인할 것

- AI 도우미 화면에서 생성 방식이 `일반 생성`, `RAG 기반 생성`, `Agent 기반 생성`으로 보이는지 확인한다.
- `일반 생성`은 기존 OpenAI 직접 생성 흐름으로 동작하는지 확인한다.
- `RAG 기반 생성`은 RAG 문서 색인/검색 후 생성되는지 확인한다.
- `Agent 기반 생성`은 결과와 함께 tool call 로그가 보이는지 확인한다.
- Swagger에서 `/ai/rag/index`, `/ai/rag/search`, `/mcp`, `/ai/agent/run`이 보이는지 확인한다.
- `/mcp`의 `mcp.list_tools`가 도구 목록을 반환하는지 확인한다.

### Edge case 확인

- RAG 자료가 없는 프로젝트에서 `/ai/rag/index`가 서버 오류 없이 `indexed_count=0`을 반환하는지 확인한다.
- RAG 자료가 없는 프로젝트에서 `/ai/rag/search`가 서버 오류 없이 빈 `items`를 반환하는지 확인한다.
- `OPENAI_API_KEY`가 없을 때 RAG 기반 생성은 사용자에게 이해 가능한 오류로 표시되는지 확인한다.
- 자동 검증에서는 `embed_texts([])`가 OpenAI 호출 없이 `[]`를 반환하는 것만 확인했다.

## 2026-06-17 QA: 제출용 데모 스크린샷

### 생성한 파일

```txt
docs/demo/login.png
```

### 확인 결과

- Headless Chrome으로 `http://localhost:5173/login` 화면을 캡처했다.
- 첫 캡처는 인증 상태 확인 중 화면으로 찍혀 다시 캡처했다.
- 두 번째 캡처에서 JungleLog 로그인 화면과 Google 로그인 버튼이 정상적으로 보였다.
- README 데모 섹션에 해당 이미지를 연결했다.

## 2026-06-17 QA: Agent RAG 중복 호출 방지

### 자동 검증할 것

- `backend/app/services/agent_service.py`에서 `rag_search` 결과를 `format_rag_context`로 변환하는지 확인한다.
- `backend/app/services/ai_service.py`에서 `rag_context_override`가 있으면 `build_rag_context`를 다시 호출하지 않는지 확인한다.
- `backend compileall app`이 성공하는지 확인한다.
- `frontend npm run build`가 성공하는지 확인한다.

### 실제 AI 호출 QA 기준

실제 `/ai/agent/run` 호출은 OpenAI embedding과 generation 비용이 발생한다.

사용자가 허락한 경우에도 다음 기준으로 최소 1회만 먼저 확인한다.

1. 기존 포트폴리오 프로젝트 1개를 선택한다.
2. Agent 기반 생성으로 `interview` 또는 `portfolio` 중 하나만 호출한다.
3. 응답에 `tool_calls`가 `get_portfolio_project`, `rag_search`, `generate_project_content` 순서로 보이는지 확인한다.
4. 같은 실행에서 서버 오류가 없는지 확인한다.
5. 응답 내용을 바로 저장하지 않고, 화면에서 결과가 자연스럽게 보이는지만 먼저 확인한다.

### 실제 QA 결과

```txt
project: ai-board-lab
user: leejunhee2796@gmail.com
rag_indexed_count: 10
mcp_project_title: ai-board-lab
mcp_linked_record_count: 1
agent_stopped_reason: completed
agent_tool_calls:
  1. get_portfolio_project success
  2. rag_search success
  3. generate_project_content success
agent_content_length: 1142
```

확인 결과:

- RAG 색인이 실제 OpenAI embedding 호출을 통해 생성되었다.
- MCP tool이 프로젝트 정보를 정상 반환했다.
- Agent가 제한된 3단계 loop를 완료했다.
- OpenAI generation 응답으로 한국어 면접 예상 질문이 생성되었다.
- 같은 Agent 실행에서 tool call 로그가 기대한 순서로 반환되었다.
