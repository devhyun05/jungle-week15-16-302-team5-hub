// 세션 10: useMemo와 파생값
// 원본 소스: ../src/pages/PostListPage.tsx
// 범위: postType에서 selectedCategory 계산하기.
// 오리엔테이션:
// - 파생값은 기존 state에서 계산되는 값이라는 점을 설명한다.
// - useMemo가 렌더 사이에서 계산 결과를 기억하는 방식임을 설명한다.
// - 의존성 배열이 언제 다시 계산할지 정한다는 점을 설명한다.
// 세션 중 Level 3 빈칸은 Codex가 채팅으로 제공한다.
// 세션 시작 전 이 파일에는 주석만 있어야 한다.
import { useState, useMemo } from "react";
type PostType = "recipe" | "failure" | "review" | "general";

interface Category {
    label: string;
    value: PostType | "";
}

const categories: Category[] = [
  { label: "전체", value: "" },
  { label: "레시피 공유", value: "recipe" },
  { label: "실패 질문", value: "failure" },
  { label: "후기", value: "review" },
  { label: "일반", value: "general" },
];

export default function useMemoDerivedPractice() {
    const [postType, setPostsType] = useState<PostType | "">("")
    const selectedCategory = useMemo(
        () =>
            categories.find((category) => category.value === postType) || categories[0],
        [postType],
    );

    function chooseType(value: PostType | "") {
        setPostsType(value);
    }
    return (
    <section>
      <h1>Session 10 useMemo derived value</h1>

      <p>현재 보기: {selectedCategory.label}</p>

      <div>
        {categories.map((category) => (
          <button
            key={category.label}
            type="button"
            onClick={() => chooseType(category.value)}
          >
            {category.label}
          </button>
        ))}
      </div>
    </section>
  );
}