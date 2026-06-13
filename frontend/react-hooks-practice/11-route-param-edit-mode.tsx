// 세션 11: 경로 매개변수와 수정 모드
// 원본 소스: ../src/pages/PostEditorPage.tsx
// 범위: useParams, postId, isEdit.
// 오리엔테이션:
// - 주소의 경로 매개변수가 문자열 또는 undefined로 들어오는 이유를 설명한다.
// - Boolean(postId)가 존재 여부를 참/거짓으로 바꾸는 방식임을 설명한다.
// - 새 글 작성과 수정 화면이 하나의 컴포넌트를 공유하고 분기하는 구조를 설명한다.
// 세션 중 Level 3 빈칸은 Codex가 채팅으로 제공한다.
// 세션 시작 전 이 파일에는 주석만 있어야 한다.
import { useState, useEffect } from "react";
import {useParams} from "react-router-dom";

interface PracticePost {
    id: string,
    title: string,
}

const posts: PracticePost[] = [
    {id:"1", title: "클리어 슬라임 끈적임 해결"},
    {id:"2", title: "버터 슬라임 기본 레시피"},
];

async function fetchPracticePost(postId:string): Promise<PracticePost> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const post = posts.find((item) => item.id === postId);

    if (!post) {
        throw new Error("게시글을 찾지 못했습니다.");
    }
    return post;
}

export default function RouteParamPractice() {
    const {postId} = useParams();
    const isEdit = Boolean(postId);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (!postId) {
            setTitle("");
            setContent("새 글 작성 모드입니다.");
            return;
        }
        const id = postId;
        let ignore = false;
        async function loadPost() {
            try {
                const post = await fetchPracticePost(id);
                if (!ignore) {
                    setTitle(post.title);
                    setContent("수정 모드입니다");
                }
            } catch (error) {
                if (!ignore) {
                    setContent(error instanceof Error ? error.message : "불러오기 실패");

                }
            }
        }
        loadPost();
        return () => {
            ignore = true;
        };
    }, [postId]);

    return (
    <section>
      <h1>{isEdit ? "게시글 수정" : "새 게시글 작성"}</h1>

      <p>주소의 postId: {postId || "없음"}</p>
      <p>{content}</p>

      <label>
        제목
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="제목"
        />
      </label>
    </section>
  );
}