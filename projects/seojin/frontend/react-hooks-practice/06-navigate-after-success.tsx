// 세션 06: 성공 후 화면 이동
// 원본 소스: ../src/pages/LoginPage.tsx, ../src/pages/PostEditorPage.tsx
// 범위: 제출 처리 함수 안에서 사용하는 useNavigate.
// 오리엔테이션:
// - useNavigate가 무엇을 반환하는지 설명한다.
// - 화면 이동이 성공한 요청 뒤에 있어야 하는 이유를 설명한다.
// - 화면 이동 함수가 JSX가 아니라 함수라는 점을 설명한다.
// 세션 중 Level 3 빈칸은 Codex가 채팅으로 제공한다.
// 세션 시작 전 이 파일에는 주석만 있어야 한다.
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";


const NavigatePractice = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(event:FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage("");
        try {
            await new Promise((resolve) => setTimeout(resolve, 700));

            if (!email.includes("@")) {
                throw new Error("이메일 형식이 올바르지 않습니다.");
            }
            navigate("/posts");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "제출 실패");
        }

    }

    return (
        <section>
        <h1>성공 후 화면 이동 연습</h1>

        <form onSubmit={handleSubmit}>
            <label>
            이메일
            <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
            />
            </label>

            <button type="submit">제출</button>
        </form>

        {message && <p>{message}</p>}
        </section>
    );
}
export default NavigatePractice;