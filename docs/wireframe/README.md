# Wireframe

이 문서는 Figma Make로 제작한 와이어프레임 PNG를 기준으로 페이지 구조를 정리한다.

## Page List

| Page | Route | Image |
|---|---|---|
| Home | `/` | `./images/home.png` |
| Login | `/login` | `./images/login.png` |
| Sign Up | `/signup` | `./images/signup.png` |
| Post Detail | `/posts/:postId` | `./images/post-detail.png` |
| Create Post | `/posts/new` | `./images/post-create.png` |
| Edit Post | `/posts/:postId/edit` | `./images/post-edit.png` |
| My Page | `/me` | `./images/my-page.png` |

## 1. Home

첫 진입 화면이다. 비로그인 사용자도 중고 거래 목록을 바로 탐색할 수 있다.

![Home wireframe](./images/home.png)

### Key UI

- Header
- Logo
- Login button
- Sign Up button
- Search bar
- Category filter
- Sort buttons
- Product card grid

### Main Actions

| Action | Result |
|---|---|
| Search | 검색어 기준으로 목록을 필터링한다. |
| Select category | 선택한 카테고리의 글만 보여준다. |
| Select sort option | 최신순, 인기순, 가격낮은순으로 정렬한다. |
| Click product card | 상세 페이지로 이동한다. |
| Click Login | 로그인 페이지로 이동한다. |
| Click Sign Up | 회원가입 페이지로 이동한다. |

## 2. Login

사용자가 기존 계정으로 로그인하는 화면이다.

![Login wireframe](./images/login.png)

### Key UI

- Email or username input
- Password input
- Remember me checkbox
- Forgot password link
- Login button
- Sign up link
- Social login buttons

### Main Actions

| Action | Result |
|---|---|
| Log In | 인증 성공 시 홈 페이지로 이동한다. |
| Sign up | 회원가입 페이지로 이동한다. |
| Google / GitHub | 소셜 로그인 플로우를 시작한다. |

## 3. Sign Up

새 사용자가 계정을 생성하는 화면이다.

![Sign Up wireframe](./images/signup.png)

### Key UI

- Username input
- Email input
- Password input
- Confirm password input
- Terms agreement checkbox
- Create account button
- Login link
- Social signup buttons

### Main Actions

| Action | Result |
|---|---|
| Create Account | 회원가입을 요청한다. |
| Log in | 로그인 페이지로 이동한다. |
| Google / GitHub | 소셜 회원가입 플로우를 시작한다. |

## 4. Post Detail

게시글 본문, 작성자 정보, AI 요약, 댓글을 확인하는 화면이다.

![Post Detail wireframe](./images/post-detail.png)

### Key UI

- Breadcrumb
- Post tags
- Post title
- Author metadata
- Post content
- Post action buttons
- Similar posts sidebar
- Author card
- AI summary box
- Comment form
- Comment list

### Main Actions

| Action | Result |
|---|---|
| Edit | 작성자라면 수정 페이지로 이동한다. |
| Like | 게시글 좋아요를 토글한다. |
| Comment | 댓글을 작성한다. |
| Similar post click | 관련 게시글 상세로 이동한다. |

## 5. Create Post

새 게시글을 작성하고 AI Writing Assistant를 사용할 수 있는 화면이다.

![Create Post wireframe](./images/post-create.png)

### Key UI

- Title input
- Tag selector
- Editor toolbar
- Content editor
- Save draft button
- Publish button
- AI Writing Assistant panel
- Quick action buttons
- AI suggestions
- Ask the AI input
- Writing stats

### AI Actions

| Action | Purpose |
|---|---|
| Improve writing | 글을 더 자연스럽게 개선한다. |
| Fix grammar | 문법과 오탈자를 수정한다. |
| Make shorter | 글을 더 짧게 요약한다. |
| Add examples | 본문에 예시를 추가한다. |
| Generate outline | 글의 개요를 생성한다. |
| Suggest tags | 본문 기반 태그를 추천한다. |

## 6. Edit Post

기존 게시글을 수정하는 화면이다. 작성 페이지와 동일한 레이아웃을 사용하되 기존 데이터가 채워진 상태로 시작한다.

![Edit Post wireframe](./images/post-edit.png)

### Key UI

- Existing title
- Existing selected tags
- Editable content
- Save draft button
- Update post button
- AI Writing Assistant panel
- Writing stats

### Main Actions

| Action | Result |
|---|---|
| Save Draft | 수정 중인 내용을 임시 저장한다. |
| Update Post | 수정 내용을 저장하고 상세 페이지로 이동한다. |
| AI quick action | 현재 본문을 기준으로 AI 보조 기능을 실행한다. |

## 7. My Page

사용자의 프로필, 내가 작성한 글, 내가 작성한 댓글을 확인하는 화면이다.

![My Page wireframe](./images/my-page.png)

### Key UI

- Profile card
- User avatar
- Email
- Member since
- Activity stats
- My Posts tab
- My Comments tab
- New Post button
- Edit / Delete actions

### Main Actions

| Action | Result |
|---|---|
| Edit Profile | 프로필 수정 플로우로 이동한다. |
| New Post | 게시글 작성 페이지로 이동한다. |
| Edit post | 게시글 수정 페이지로 이동한다. |
| Delete post | 게시글 삭제 확인을 표시한다. |
| Delete comment | 댓글 삭제 확인을 표시한다. |

## Implementation Notes

- 홈 페이지의 글 목록과 상세 조회는 비로그인 사용자도 접근할 수 있다.
- 글쓰기, 글 수정, 댓글 작성, 마이페이지, AI Writing Assistant 실행은 로그인 사용자만 사용할 수 있다.
- AI Summary와 Similar Posts는 게시글 상세 화면에 배치한다.
- AI Writing Assistant는 작성/수정 화면 오른쪽 패널에 고정한다.

## Change History

| Date | Author | Description |
|---|---|---|
| 2026-06-06 | Hyunseong Lee | Add wireframe PNG documentation |
