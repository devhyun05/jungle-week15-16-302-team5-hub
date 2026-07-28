// 세션 03: 제어 입력
// 원본 소스: ../src/pages/LoginPage.tsx
// 범위: React 상태로 제어되는 이메일/비밀번호 입력 필드.
// 오리엔테이션:
// - 입력 요소가 값을 직접 소유하지 않고 React 상태가 값을 소유한다는 점을 설명한다.
// - value가 상태를 화면 입력 요소로 내려보내는 역할임을 설명한다.
// - onChange가 화면 입력값을 다시 상태로 올리는 역할임을 설명한다.
// 세션 중 Level 3 빈칸은 Codex가 채팅으로 제공한다.
// 세션 시작 전 이 파일에는 주석만 있어야 한다.
import {useState} from "react";

const ControlledInputPractice = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    return (
        <section>
            <h1>controlled input 연습</h1>
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

            <label>
                비밀번호
                <input
                    type="password"
                    value={password}
                    onChange={(event) => {
                        setPassword(event.target.value);
                    }}
                />
            </label>

            <p>이메일: {email}</p>
            <p>비밀번호 길이: {password.length}</p>

            <button
                type="button"
                onClick={() => {
                    setEmail("");
                    setPassword("");
                }}
            >
                초기화
            </button>
        </section>
    );
}

export default ControlledInputPractice;