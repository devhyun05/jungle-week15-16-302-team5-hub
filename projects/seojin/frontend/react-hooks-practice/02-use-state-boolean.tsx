// 세션 02: useState - boolean 상태
// 원본 소스: ../src/pages/SignupPage.tsx
// 범위: 약관 동의 체크박스와 조건부 UI.
// 오리엔테이션:
// - boolean 상태가 true/false를 기억하는 방식임을 설명한다.
// - value와 checked의 차이를 설명한다.
// - 체크박스가 event.target.checked를 읽는 이유를 설명한다.
// 세션 중 Level 3 빈칸은 Codex가 채팅으로 제공한다.
// 세션 시작 전 이 파일에는 주석만 있어야 한다.

import {useState} from "react";

const UseStateBooleanPractice = () => {
    const[agree, setAgree] = useState(false);
    return (
        <section>
            <h1>boolean state 연습</h1>
            <label>
                <input
                    type="checkbox"
                    checked={agree}
                    onChange={(event) => {
                        setAgree(event.target.checked);
                    }}
                />
                이용약관에 동의합니다.
            </label>
            {agree ? (
                <p>동의 완료</p>
            ): (
                <p>동의하지 않았습니다.</p>
            )}
            <button
                type="button"
                onClick={() => {
                    setAgree(false);
                }}>
                동의 초기화
            </button>
        </section>
    );
}

export default UseStateBooleanPractice;
