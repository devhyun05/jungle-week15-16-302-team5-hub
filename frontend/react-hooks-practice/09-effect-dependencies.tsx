// 세션 09: effect 의존성
// 원본 소스: ../src/pages/PostListPage.tsx
// 범위: 페이지, 분류, 제출된 검색어가 바뀔 때 게시글 다시 불러오기.
// 오리엔테이션:
// - 의존성 배열이 "이 값들이 바뀌면 다시 실행"을 뜻한다는 점을 설명한다.
// - keyword와 submittedKeyword를 분리하는 이유를 설명한다.
// - 오래된 비동기 응답을 무시 표시값으로 건너뛰는 이유를 설명한다.
// 세션 중 Level 3 빈칸은 Codex가 채팅으로 제공한다.
// 세션 시작 전 이 파일에는 주석만 있어야 한다.
import { useState, useEffect } from "react";
const POSTS = [
    "클리어 슬라임 끈적임 해결",
    "버터 슬라임 기본 레시피",
    "구름 슬라임이 물러졌을 때",
];

const EffectDependencyPractice = () => {
    const [keyword, setKeyword] = useState("");
    const [submitKeyword, setSubmitKeyword] = useState("");
    const [posts, setPosts] = useState<string[]>(POSTS);

    useEffect(() => {
        const result = POSTS.filter((post) =>
            post.includes(submitKeyword)
        );
        setPosts(result);
    }, [submitKeyword]);

    function handleSubmit (event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitKeyword(keyword);
    }

    return (
        <section>
        <h1>Session 9 search dependency</h1>

        <form onSubmit={handleSubmit}>
            <input
            value={keyword} // (h) input에 보여줄 값
            onChange={(event) => setKeyword(event.target.value)} // (i) 브라우저가 준 현재 입력값
            placeholder="검색어"
            />
            <button type="submit">검색</button>
        </form>

        <p>입력 중: {keyword}</p>
        <p>검색 확정: {submitKeyword || "아직 검색 전"}</p>

        <ul>
            {posts.map((post) => (
            <li key={post}>{post}</li>
            ))}
        </ul>
        </section>
    );
}
export default EffectDependencyPractice;