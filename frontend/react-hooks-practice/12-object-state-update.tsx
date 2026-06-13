// 세션 12: 객체 상태 업데이트
// 원본 소스: ../src/pages/PostEditorPage.tsx
// 범위: form 객체의 필드 하나만 바꾸기.
// 오리엔테이션:
// - 객체 상태는 필드 하나를 바꿀 때도 먼저 복사해야 함을 설명한다.
// - setForm이 현재 상태를 받는 함수를 받을 수 있음을 설명한다.
// - 계산된 속성 이름 [key]가 동적으로 필드를 고르는 방식임을 설명한다.
// 세션 중 Level 3 빈칸은 Codex가 채팅으로 제공한다.
// 세션 시작 전 이 파일에는 주석만 있어야 한다.
import { useState } from "react";

type FormState = {
    title: string;
    content: string;
    postType: "recipe" | "failure" | "review" | "general";
};

const initalForm: FormState = {
    title: "",
    content: "",
    postType: "failure",
};

export default function ObjectStateUpdatePractice() {
    const [form, setForm] = useState<FormState>(initalForm);
    function updateForm<K extends keyof FormState> (
        key: K,
        value: FormState[K],
    ) {
        setForm (
            (current) => ( {
                ...current,
                [key]: value,
            })
        );
    }

    return (
    <section>
      <h1>객체 state 업데이트</h1>

      <input
        value={form.title}
        onChange={(event) => updateForm("title", event.target.value)}
        placeholder="제목"
      />

      <textarea
        value={form.content}
        onChange={(event) => updateForm("content", event.target.value)}
        placeholder="본문"
      />

      <button type="button" onClick={() => updateForm("postType", "recipe")}>
        레시피
      </button>

      <p>제목: {form.title}</p>
      <p>본문: {form.content}</p>
      <p>유형: {form.postType}</p>
    </section>
  );
}