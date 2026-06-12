// 세션 07: 화면에 처음 붙는 시점의 useEffect
// 원본 소스: ../src/pages/PostEditorPage.tsx
// 범위: 초기 데이터를 한 번 불러오기.
// 오리엔테이션:
// - 렌더가 먼저 일어나고 effect가 렌더 이후 실행된다는 점을 설명한다.
// - 의존성 배열 []가 "처음 화면에 붙은 뒤 한 번"을 뜻하는 이유를 설명한다.
// - 비동기 로직을 effect 안의 내부 함수로 두는 이유를 설명한다.
// 세션 중 Level 3 빈칸은 Codex가 채팅으로 제공한다.
// 세션 시작 전 이 파일에는 주석만 있어야 한다.
import {useState, useEffect} from "react";

async function fetchInitialTitle(): Promise<string> {
    return "클리어 슬라임 실패 기록";
}

export default function EffectOnMountPractice() {
    const [title, setTitle] = useState("");
    useEffect(() => {
        async function loadPost() {
            const nextTitle = await fetchInitialTitle();
            setTitle(nextTitle);
        }
        loadPost();
    },[]);
    return (
        <section>
        <h1>Session 7</h1>
        <p>불러온 제목: {title || "아직 불러오는 중"}</p>
        </section>
    );
}