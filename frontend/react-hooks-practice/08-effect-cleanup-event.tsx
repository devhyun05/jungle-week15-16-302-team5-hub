// 세션 08: 브라우저 이벤트와 effect 정리
// 원본 소스: ../src/components/Header.tsx
// 범위: 이벤트 리스너 등록과 해제.
// 오리엔테이션:
// - React state가 localStorage 값을 화면에 반영하는 방식임을 설명한다.
// - addEventListener가 브라우저 세계와 연결하는 작업임을 설명한다.
// - cleanup에서 같은 함수 참조를 넘겨 연결을 해제해야 하는 이유를 설명한다.
// 세션 중 Level 3 빈칸은 Codex가 채팅으로 제공한다.
// 세션 시작 전 이 파일에는 주석만 있어야 한다.
import { useState, useEffect } from "react";

type PracticeUser = {
    nickname: string;
};

const PRACTICE_AUTH_EVENT = "auth-change";

function getPracticeUser() {
    const raw = window.localStorage.getItem("practice_user");
    return raw ? (JSON.parse(raw) as PracticeUser) : null;
}

export default function EffectCleanupPractice() {
    const [user, setUser] = useState<PracticeUser | null>(() => getPracticeUser());

    useEffect(() => {
        const syncUser = () => {
            setUser(getPracticeUser());
        };
        window.addEventListener(PRACTICE_AUTH_EVENT, syncUser);
        window.addEventListener("storage", syncUser);

        return () => {
            window.removeEventListener(PRACTICE_AUTH_EVENT, syncUser);
            window.removeEventListener("storage", syncUser);
        };
    }, []);

    function handleLogin() {
        window.localStorage.setItem(
            "practice_user",
            JSON.stringify({nickname: "서진"})
        );
        window.dispatchEvent(new Event(PRACTICE_AUTH_EVENT));
    }

    function handleLogout() {
        window.localStorage.removeItem("practice_user");
        window.dispatchEvent(new Event(PRACTICE_AUTH_EVENT));
    }

    return (
        <section>
            <h1>Session 8 cleanup</h1>
            <p>{user? `${user.nickname} 로그인 중 `: "로그아웃 상태"}</p>
            <button type="button" onClick={handleLogin}>로그인 흉내</button>
            <button type="button" onClick={handleLogout}>로그아웃 흉내</button>
        </section>
    )
}