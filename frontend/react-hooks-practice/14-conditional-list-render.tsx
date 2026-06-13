// 세션 14: 조건부 렌더링과 목록 렌더링
// 원본 소스: ../src/pages/PostListPage.tsx, ../src/pages/PostDetailPage.tsx
// 범위: 로딩 상태, 안내 문구 상태, 빈 목록 상태, map.
// 오리엔테이션:
// - 조건부 렌더링이 어떤 JSX를 화면에 둘지 선택하는 방식임을 설명한다.
// - map이 데이터 배열을 JSX 배열로 바꾸는 방식임을 설명한다.
// - key가 렌더 사이에서 React가 목록 항목을 추적하는 데 필요함을 설명한다.
// 세션 중 Level 3 빈칸은 Codex가 채팅으로 제공한다.
// 세션 시작 전 이 파일에는 주석만 있어야 한다.


import { useState } from "react"; // (a) state를 쓰기 위한 React Hook

type PracticePost = {
  id: number;
  title: string;
  summary: string;
  tags: string[];
};

const samplePosts: PracticePost[] = [
  {
    id: 1,
    title: "클리어 슬라임이 너무 끈적여요",
    summary: "물풀 비율과 액티베이터 양을 다시 확인해보는 글입니다.",
    tags: ["끈적임", "실패해결"],
  },
  {
    id: 2,
    title: "버터 슬라임 레시피 기록",
    summary: "부드러운 질감을 만들기 위해 점토를 조금씩 섞었습니다.",
    tags: ["버터슬라임", "레시피"],
  },
];

export default function ConditionalListRenderPractice() {
  // 화면에 보여줄 게시글 배열 state
  const [posts, setPosts] = useState<PracticePost[]>(samplePosts); // (b) posts 이름들, (c) Hook, (d) 초기값

  // 에러나 안내 문구 state
  const [message, setMessage] = useState(""); // (e) message 이름들, (f) 초기값

  // 로딩 여부 state
  const [isLoading, setIsLoading] = useState(false); // (g) isLoading 이름들, (h) 초기값

  function showLoading() {
    setIsLoading(true);
    setMessage("");
    setPosts([]);
  }

  function showEmpty() {
    setIsLoading(false);
    setMessage("");
    setPosts([]);
  }

  function showList() {
    setIsLoading(false);
    setMessage("");
    setPosts(samplePosts);
  }

  function showError() {
    setIsLoading(false);
    setMessage("게시글을 불러오지 못했습니다.");
    setPosts([]);
  }

  return (
    <section>
      <h1>조건부 목록 렌더링</h1>

      <div>
        <button type="button" onClick={showLoading}>로딩</button>
        <button type="button" onClick={showEmpty}>빈 목록</button>
        <button type="button" onClick={showList}>목록</button>
        <button type="button" onClick={showError}>에러</button>
      </div>

      {/* message가 있을 때만 안내 문구를 보여준다 */}
      {message && <p role="alert">{message}</p>}

      {/* 로딩 중일 때만 로딩 문구를 보여준다 */}
      {isLoading && <p>게시글을 불러오는 중입니다.</p>}

      {/* 로딩이 끝난 뒤 posts 길이에 따라 빈 화면 또는 목록을 보여준다 */}
      {!isLoading && (
        posts.length === 0 ? (
          <div>
            <p>검색 결과가 없어요.</p>
            <p>다른 태그나 검색어로 다시 찾아보세요.</p>
          </div>
        ) : (
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <h2>{post.title}</h2>
                <p>{post.summary}</p>

                <div>
                  {post.tags.length > 0 ? (
                    post.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))
                  ) : (
                    <span>태그없음</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  );
}