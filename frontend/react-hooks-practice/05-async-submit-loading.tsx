// 세션 05: 비동기 제출과 로딩 상태
// 원본 소스: ../src/pages/LoginPage.tsx, ../src/pages/PostEditorPage.tsx
// 범위: 비동기 요청, 안내 문구 상태, 제출 중 상태.
// 오리엔테이션:
// - async/await가 코드 흐름을 어떻게 바꾸는지 설명한다.
// - UI 요청 처리에 try/catch/finally가 잘 맞는 이유를 설명한다.
// - loading을 await 전에 켜고 finally에서 끄는 이유를 설명한다.
// 세션 중 Level 3 빈칸은 Codex가 채팅으로 제공한다.
// 세션 시작 전 이 파일에는 주석만 있어야 한다.
import { useState } from "react";
import type { FormEvent } from "react";

const AsyncSubmitLoadingPractice = () => {
    const [email, setEmail] = useState(""); //처음 입력값
    const [message, setMessage] = useState(""); //처음 안내 문구
    const [isSubmit, setIsSubmit] = useState(false);    //처음 제출 중 상태
    async function handleSubmit(event:FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage("");
        setIsSubmit(true);

        try {
        await new Promise((resolve) => setTimeout(resolve, 700));
        if(!email.includes("@")) {
            throw new Error("이메일 형식이 올바르지 않습니다.");
        }
        setMessage("성공");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "제출에 실패했습니다.");
        } finally {
            setIsSubmit(false);
        }
    }


    return (
        <section>
            <h1>비동기 제출과 로딩 상태 연습</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    이메일
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                        }}
                    />
                </label>

                <button type="submit" disabled={isSubmit}>
                    {isSubmit ? "제출 중..." : "제출"}
                </button>
            </form>

            <p>입력 중: {email || "아직 입력 전"}</p>
            {message && <p>{message}</p>}
        </section>
    );
}

export default AsyncSubmitLoadingPractice;