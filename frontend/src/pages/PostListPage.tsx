import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import type { PostCardData } from "../types";

interface Category {
  label: string;
  description: string;
  icon: string;
  selected?: boolean;
}

const categories: Category[] = [
  { label: "레시피 공유", description: "슬라임 제작 레시피", icon: "R", selected: true },
  { label: "실패 질문", description: "실패 원인 질문과 해결", icon: "Q" },
  { label: "후기", description: "제작 결과 후기", icon: "V" },
  { label: "팁", description: "유용한 관리 팁", icon: "T" },
];

const filterTags = [
  "전체",
  "클리어슬라임",
  "버터슬라임",
  "크런치슬라임",
  "물먹음",
  "끈적임",
  "베이스실패",
  "풀베이스",
];

const posts: PostCardData[] = [
  {
    id: 1,
    type: "failure",
    title: "클리어 슬라임 만들었는데 자꾸 거품이 생겨요",
    summary: "글루에 활성제를 넣는 순서를 바꿔봤는데도 거품이 잡히지 않아요.",
    tags: ["클리어슬라임", "거품", "투명도"],
    hasImage: true,
    author: "민트연구원",
    time: "2시간 전",
    comments: 12,
    saves: 34,
  },
  {
    id: 2,
    type: "recipe",
    title: "버터슬라임 황금 레시피 공유합니다",
    summary: "습도 관계없이 일정한 질감을 유지하는 비율을 정리했어요.",
    tags: ["버터슬라임", "황금레시피", "점도조절"],
    hasImage: true,
    author: "슬라임장인",
    time: "4시간 전",
    comments: 28,
    saves: 156,
  },
  {
    id: 3,
    type: "review",
    title: "크런치슬라임에 넣을 필러 조합 후기",
    summary: "어항 자갈과 미니 폼볼 조합이 소리도 좋고 촉감도 안정적이었습니다.",
    tags: ["크런치슬라임", "필러", "소리"],
    author: "아쿠아드롭",
    time: "6시간 전",
    comments: 7,
    saves: 23,
  },
  {
    id: 4,
    type: "tip",
    title: "장마철 슬라임 보관하는 꿀팁 모음",
    summary: "실리카겔 배치부터 밀폐 용기 선택까지 습도 높은 날 관리법을 모았습니다.",
    tags: ["보관법", "장마", "습도"],
    author: "라벤더공방",
    time: "어제",
    comments: 19,
    saves: 87,
  },
];

export default function PostListPage() {
  return (
    <section className="page-stack">
      <div className="section-title-row">
        <div className="page-header">
          <h1>슬라임 연구 게시판</h1>
          <p className="muted">총 4,281개의 게시글 · 오늘 28개 작성됨</p>
        </div>
        <Link to="/posts/new" className="button">글쓰기</Link>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <article className="surface-card stat-card" key={category.label}>
            <span className={category.selected ? "icon-pill" : "icon-pill lavender"}>{category.icon}</span>
            <div>
              <h3>{category.label}</h3>
              <p className="meta">{category.description}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="surface-card">
        <div className="toolbar">
          <input className="search-input" aria-label="게시글 검색" placeholder="제목, 내용, 재료 검색" />
          <button className="ghost-button" type="button">필터</button>
          <button className="ghost-button" type="button">최신순</button>
        </div>
      </div>

      <div className="chip-row">
        {filterTags.map((tag) => (
          <span className={tag === "전체" ? "chip is-selected" : "chip"} key={tag}>
            {tag === "전체" ? "#전체" : `#${tag}`}
          </span>
        ))}
      </div>

      <div className="post-grid">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <div className="pagination">
        <span className="chip is-selected">1</span>
        <span className="chip">2</span>
        <span className="chip">3</span>
        <span className="chip">4</span>
      </div>
    </section>
  );
}
