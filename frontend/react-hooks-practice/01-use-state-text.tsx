// 세션 01: useState - 문자열 상태
// 원본 소스: ../src/pages/LoginPage.tsx
// 범위: 문자열 값 하나, setter 하나, 초기화 버튼 하나.
// 오리엔테이션:
// - setState 이후 컴포넌트 함수가 왜 다시 실행되는지 설명한다.
// - useState가 왜 [값, setter] 형태를 반환하는지 설명한다.
// - setter 이름이 보통 "set"으로 시작하는 이유를 설명한다.
// 세션 중 Level 3 빈칸은 Codex가 채팅으로 제공한다.
// 세션 시작 전 이 파일에는 주석만 있어야 한다.

// react의 useState 호출
import {useState} from "react";
const UseStateTextPractice = () => {
    // useState 선언 : 상태저장용
    const[text, setText] = useState("");
    return (
        // 섹션 : 큰 박스 만들기
        <section>
            <h1>문자열 state 연습</h1>
            <input
                value = {text}
                onChange = {(event)=>{
                    setText(event.target.value);
                }}
                placeholder="텍스트를 입력하세요"
            />
            <p>현재 값 : {text || "비어있음"}</p>
            <button type="button" onClick={() => {
                setText("");
            }}>
            초기화
            </button>
        </section>
    );
}

export default UseStateTextPractice;