import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import TagBadge from "../components/TagBadge";
import type { PostCardData, Tone } from "../types";

const popularTags = [
  "클리어슬라임",
  "버터슬라임",
  "물먹음",
  "끈적임",
  "베이스실패",
  "풀베이스",
  "크런치슬라임",
];

interface FeatureCard {
  title: string;
  copy: string;
  badge: string;
  icon: string;
  tone: Tone;
  link: string;
}

const featureCards: FeatureCard[] = [
  {
    title: "RAG 유사 사례 검색",
    copy: "내 증상과 비슷한 커뮤니티 게시글을 찾아 해결 단서를 정리합니다.",
    badge: "RAG",
    icon: "R",
    tone: "mint",
    link: "사례 검색하기",
  },
  {
    title: "MCP 습도 기반 관리 팁",
    copy: "현재 습도와 온도에 맞춰 보관과 점도 조절 팁을 제공합니다.",
    badge: "MCP",
    icon: "M",
    tone: "lavender",
    link: "환경 팁 보기",
  },
  {
    title: "말랑 진단 에이전트",
    copy: "증상, 재료, 날씨 정보를 조합해 원인과 다음 행동을 제안합니다.",
    badge: "Agent",
    icon: "A",
    tone: "coral",
    link: "AI 진단 받기",
  },
];

const recentPosts: PostCardData[] = [
  {
    id: 1,
    type: "failure",
    title: "클리어 슬라임 만들었는데 자꾸 거품이 생겨요",
    summary: "활성제를 넣는 순서를 바꿔봤는데도 거품이 잡히지 않아 원인을 찾고 있어요.",
    tags: ["클리어슬라임", "거품", "투명도"],
    author: "민트연구원",
    time: "2시간 전",
    comments: 12,
    saves: 34,
  },
  {
    id: 2,
    type: "recipe",
    title: "버터슬라임 황금 레시피 공유합니다",
    summary: "6개월 동안 조절한 버터슬라임 최종 레시피입니다. 습도와 상관없이 질감이 일정해요.",
    tags: ["버터슬라임", "황금레시피", "점도조절"],
    author: "슬라임장인",
    time: "4시간 전",
    comments: 28,
    saves: 156,
  },
];

export default function HomePage() {
  return (
    <section className="page-stack">
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">AI 기반 슬라임 연구 커뮤니티</span>
          <h1>슬라임 만들다 막혔을 때, 말랑 연구소에서 해결하세요</h1>
          <p className="lead">레시피 공유, 실패 원인 분석, AI 진단까지 슬라임 메이커들의 연구실입니다.</p>
        </div>
        <div className="hero-actions">
          <input className="search-input" aria-label="슬라임 검색" placeholder="슬라임 이름, 재료, 실패 증상 검색" />
          <Link to="/posts" className="button">검색</Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="surface-card stat-card">
          <span className="icon-pill">P</span>
          <p className="meta">전체 게시글 <span className="stat-value">4,281개</span></p>
        </div>
        <div className="surface-card stat-card">
          <span className="icon-pill">U</span>
          <p className="meta">활성 연구원 <span className="stat-value">1,839명</span></p>
        </div>
        <div className="surface-card stat-card">
          <span className="icon-pill">S</span>
          <p className="meta">해결된 실패 사례 <span className="stat-value">982건</span></p>
        </div>
      </div>

      <div className="page-stack">
        <div className="section-title-row">
          <h2>인기 태그</h2>
        </div>
        <div className="tag-row">
          {popularTags.map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </div>
      </div>

      <div className="page-stack">
        <div className="section-title-row">
          <h2>AI 기능 둘러보기</h2>
          <span className="meta">RAG · MCP · Agent</span>
        </div>
        <div className="feature-grid">
          {featureCards.map((card) => (
            <article className="feature-card" key={card.badge}>
              <div className="feature-card-header">
                <span className={`feature-icon ${card.tone === "mint" ? "" : card.tone}`}>{card.icon}</span>
                <span className={`badge badge-${card.tone}`}>{card.badge}</span>
              </div>
              <div>
                <h3>{card.title}</h3>
                <p className="card-copy">{card.copy}</p>
              </div>
              <Link className={`feature-link ${card.tone === "mint" ? "" : card.tone}`} to="/posts">
                {card.link} →
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div className="page-stack">
        <div className="section-title-row">
          <h2>최근 게시글</h2>
          <Link className="feature-link" to="/posts">전체 보기 →</Link>
        </div>
        <div className="post-grid">
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
