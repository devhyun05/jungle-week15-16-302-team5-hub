# DB Q&A

## users

### Q. users에 email이 필요한가?

A. Slack 로그인 식별에는 필수는 아니지만, CSV 대조를 위해 저장한다.

### Q. users에 deleted_at이 필요한가?

A. 사용자 탈퇴/비활성화 처리를 soft delete로 관리하기 위해 사용한다.

## posts

### Q. posts에 deleted_at column이 필요한 이유는?

A. 판매글 삭제 시 실제 row를 삭제하지 않고, 복구/관리자 확인/분쟁 대응을 위해 삭제 시각만 기록하기 위해 사용한다.

### Q. posts와 users는 어떤 관계인가?

A. users 1명은 posts 0개 이상을 작성할 수 있고, posts 1개는 반드시 users 1명에 속한다.

## categories

### Q. slug는 무엇인가?

A. 화면 표시용 name과 별도로, API/URL/코드에서 안정적으로 쓰기 위한 문자열 식별자다.

### Q. sort_order column의 목적이란?

A. 카테고리를 화면에 어떤 순서로 디스플레이 할지 정하기 위해서

## post_likes

### Q. post_likes는 왜 필요한가?

A. 좋아요 수뿐 아니라 어떤 유저가 어떤 게시글에 좋아요를 눌렀는지 기록하기 위해 필요하다.
