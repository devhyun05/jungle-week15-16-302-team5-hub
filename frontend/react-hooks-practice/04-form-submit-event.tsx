// 세션 04: form submit 이벤트
// 원본 소스: ../src/pages/LoginPage.tsx, ../src/pages/PostListPage.tsx
// 범위: FormEvent 타입을 붙인 submit handler.
// 오리엔테이션:
// - FormEvent<HTMLFormElement>가 무엇을 뜻하는지 설명한다.
// - form이 기본적으로 페이지를 새로고침하는 이유를 설명한다.
// - event.preventDefault()가 submit handler의 첫 줄에 자주 오는 이유를 설명한다.
// - 입력 중인 keyword와 제출된 submittedKeyword를 분리하는 이유를 설명한다.
// 세션 중 Level 3 빈칸은 Codex가 채팅으로 제공한다.
// 세션 시작 전 이 파일에는 주석만 있어야 한다.
import { useState } from "react";
import type { FormEvent } from "react";

const FormSubmitEventPractice = () => {
    const [keyword, setKeyword] = useState("");  // 지금 input에 치고 있는 값
    const [subKeyword, setSubKeyword] = useState("");   // 제출 버튼을 누른 순간 확정된 값
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // 폼은 기본적으로 새로고침/다른 주소로 이동이다. 리엑트 앱에서는 페이지가 새로고침되면 현재 상태가 날아가니까 새로고침 기본동작을 막겠다는 코드이다.
        setSubKeyword(keyword);
    };
    return (
        <section>
            <h1>form submit 이벤트 연습 </h1>
            <form onSubmit={handleSubmit}>
                <label>
                    검색어
                    <input
                        type="text"
                        value={keyword}
                        onChange={(event) => {
                            setKeyword(event.target.value);
                        }}
                    />
                </label>
                <button type="submit">검색</button>
            </form>

            <p>입력 중 : {keyword}</p>
            <p>제출됨 : {subKeyword || "아직 제출 전"}</p>
        </section>
    );
}
export default FormSubmitEventPractice;