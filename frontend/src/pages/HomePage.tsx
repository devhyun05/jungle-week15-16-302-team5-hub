import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import type { PostCardData, Tone } from "../types";
import {
  badgeBase,
  badgeTone,
  button,
  cardCopy,
  cn,
  featureLinkTone,
  ghostButton,
  h2,
  h3,
  heroH1,
  iconBase,
  iconTone,
  lead,
  meta,
  pageStack,
  panelCard,
  sectionTitleRow,
} from "../styles/ui";

interface FeatureCard {
  title: string;
  copy: string;
  badge: string;
  icon: string;
  tone: Tone;
  link: string;
  path: string;
}

const featureCards: FeatureCard[] = [
  {
    title: "게시판",
    copy: "레시피, 실패 질문, 후기를 유형별로 작성하고 검색합니다.",
    badge: "CRUD",
    icon: "B",
    tone: "mint",
    link: "게시글 보기",
    path: "/posts",
  },
  {
    title: "AI Agent",
    copy: "질문을 분석해 내부 지식과 외부 도구 결과를 한 화면에 모읍니다.",
    badge: "AI",
    icon: "A",
    tone: "lavender",
    link: "Agent 실행",
    path: "/agent",
  },
  {
    title: "실패 해결 글쓰기",
    copy: "증상과 시도한 방법을 남기면 태그와 AI 진단 흐름에 연결됩니다.",
    badge: "Post",
    icon: "W",
    tone: "coral",
    link: "글쓰기",
    path: "/posts/new",
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
  },
  {
    id: 2,
    type: "recipe",
    title: "버터슬라임 황금 레시피 공유합니다",
    summary: "6개월 동안 조절한 버터슬라임 최종 레시피입니다. 클레이와 글루 비율을 정리했어요.",
    tags: ["버터슬라임", "황금레시피", "점도조절"],
    author: "슬라임장인",
    time: "4시간 전",
    comments: 28,
  },
];

export default function HomePage() {
  return (
    <section className={pageStack}>
      <div
        className="relative overflow-hidden rounded-lg border border-line bg-white shadow-card"
        style={{ backgroundImage: "url('/slime-hero.svg')", backgroundPosition: "center", backgroundSize: "cover" }}
      >
        <div className="grid min-h-[380px] content-end bg-gradient-to-r from-white via-white/95 to-white/30 p-7 md:min-h-[430px] md:p-12">
          <div className="grid max-w-[680px] gap-4">
            <span className="inline-flex justify-self-start rounded-full border border-line bg-white/90 px-3.5 py-2 text-base font-extrabold text-mint-dark shadow-subtle">
              AI 기반 슬라임 연구 커뮤니티
            </span>
            <h1 className={heroH1}>슬라임 만들다 막혔을 때, 게시글과 Agent로 해결하세요</h1>
            <p className={lead}>
              레시피와 실패 사례를 모으고, Agent가 내부 지식과 외부 도구 결과를 한 화면에서 정리합니다.
            </p>
            <div className="flex flex-wrap items-center gap-3 max-md:flex-col max-md:items-stretch">
              <Link to="/agent" className={button}>Agent 실행</Link>
              <Link to="/posts" className={ghostButton}>게시판 보기</Link>
            </div>
          </div>
        </div>
      </div>

      <div className={pageStack}>
        <div className={sectionTitleRow}>
          <h2 className={h2}>핵심 기능</h2>
          <span className={meta}>과제 시연에 필요한 화면만 간단히 정리했습니다.</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((card) => (
            <article className={cn(panelCard, "grid min-h-[180px] gap-4 p-[22px]")} key={card.badge}>
              <div className="flex items-start justify-between gap-4">
                <span className={cn(iconBase, iconTone[card.tone])}>{card.icon}</span>
                <span className={cn(badgeBase, badgeTone[card.tone])}>{card.badge}</span>
              </div>
              <div>
                <h3 className={h3}>{card.title}</h3>
                <p className={cardCopy}>{card.copy}</p>
              </div>
              <Link className={cn("font-extrabold", featureLinkTone[card.tone])} to={card.path}>
                {card.link} →
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div className={pageStack}>
        <div className={sectionTitleRow}>
          <h2 className={h2}>최근 게시글</h2>
          <Link className="font-extrabold text-mint-dark" to="/posts">전체 보기 →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
