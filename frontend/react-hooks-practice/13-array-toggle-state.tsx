// 세션 13: 배열 토글 상태
// 원본 소스: ../src/pages/PostEditorPage.tsx
// 범위: 태그 선택과 선택 해제.
// 오리엔테이션:
// - includes가 이미 선택된 항목인지 확인하는 방식임을 설명한다.
// - filter가 기존 배열을 직접 바꾸지 않고 항목을 제거하는 방식임을 설명한다.
// - 전개 문법이 항목 하나가 추가된 새 배열을 만드는 방식임을 설명한다.
// - slice로 최대 개수를 제한하는 방식을 설명한다.
// 세션 중 Level 3 빈칸은 Codex가 채팅으로 제공한다.
// 세션 시작 전 이 파일에는 주석만 있어야 한다.
import { useState } from "react"; // (a) 배열 state를 만들 때 필요한 Hook

// 사용자가 선택할 수 있는 태그 목록
const availableTags = [
  "클리어슬라임",
  "버터슬라임",
  "크런치슬라임",
  "끈적임",
  "거품",
  "실패해결",
  "색소",
  "향료",
  "눈꽃슬라임",
];

interface FormState {
    title: string;
    tag_names: string[];
}

const initalForm: FormState = {
    title: "",
    tag_names: [],
}

export default function ArrayToggleStatePractice() {
    const [form, setForm] = useState<FormState>(initalForm);

    function toggleTag(tag: string) {
        setForm(function (current) {
            const exists = current.tag_names.includes(tag);

            return {
                ...current,
                tag_names: exists ?
                current.tag_names.filter((item)=> item != tag) :
                [...current.tag_names, tag].slice(0,8),
            };
        }) ;
    }
    return (
    <section>
      <h1>태그 선택 연습</h1>

      <div>
        {availableTags.map((tag) => {
          const selected = form.tag_names.includes(tag);
          //                              (m) 이 태그가 선택됐는지 확인

          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              //             (n) 클릭하면 토글 함수 실행
            >
              {selected ? "✓ " : ""}
              {tag}
            </button>
          );
        })}
      </div>

      <p>선택한 태그 수: {form.tag_names.length} / 8</p>

      <ul>
        {form.tag_names.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </section>
  );
}