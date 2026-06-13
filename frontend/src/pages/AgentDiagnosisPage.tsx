import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { routeAgent, type AgentRouteResponse } from "../api/ai";
import TagBadge from "../components/TagBadge";
import type { Tone } from "../types";
import {
  badgeBase,
  badgeTone,
  button,
  cardCopy,
  cn,
  ghostButton,
  h1,
  h2,
  h3,
  meta,
  muted,
  pageHeader,
  pageStack,
  panelCard,
  sectionTitleRow,
  surfaceCard,
  tagRow,
  textarea,
} from "../styles/ui";

const examples = [
  "클리어 슬라임이 너무 끈적이고 손에 계속 묻어요",
  "버터 슬라임 만들 재료랑 구매처 알려줘",
  "딸기향 투명 슬라임 만드는 법이랑 액티베이터 가격 알려줘",
];

const routeMeta: Record<AgentRouteResponse["route"], { label: string; copy: string; tone: Tone }> = {
  rag: {
    label: "RAG",
    copy: "비슷한 게시글과 실패 사례를 우선 확인합니다.",
    tone: "mint",
  },
  mcp: {
    label: "MCP",
    copy: "외부 도구 결과가 필요한 요청으로 판단했습니다.",
    tone: "lavender",
  },
  "rag+mcp": {
    label: "RAG + MCP",
    copy: "내부 지식과 외부 도구 결과를 함께 사용합니다.",
    tone: "coral",
  },
};

const capabilities: Array<{ title: string; badge: string; copy: string; tone: Tone }> = [
  {
    title: "내부 지식",
    badge: "RAG",
    copy: "게시글, 태그, 실패 사례를 검색해 답변 근거로 사용합니다.",
    tone: "mint",
  },
  {
    title: "외부 도구",
    badge: "MCP",
    copy: "재료나 구매 정보가 필요할 때 도구 호출 결과를 붙입니다.",
    tone: "lavender",
  },
];

function getToolLabel(tool: string) {
  const labels: Record<string, string> = {
    "rag.search_internal_posts": "내부 게시글 검색",
    "mcp.search_products": "상품 검색 도구",
  };
  return labels[tool] || tool;
}

function buildDemoResult(message: string): AgentRouteResponse {
  const usesMcp = /구매|가격|재료|글루|액티베이터|향료|파츠|어디/.test(message);
  const usesRag = /만들|방법|레시피|실패|해결|끈적|달라붙|거품|딱딱/.test(message);
  const route: AgentRouteResponse["route"] = usesMcp && usesRag ? "rag+mcp" : usesMcp ? "mcp" : "rag";

  const rag = route.includes("rag")
    ? {
        query: message,
        items: [
          {
            title: "클리어 슬라임 끈적임 해결 사례",
            post_type: "failure",
            score: 92,
            excerpt: "액티베이터를 한 번에 많이 넣지 말고 2~3방울씩 추가하며 충분히 치대는 방식이 효과적입니다.",
            tags: ["클리어슬라임", "끈적임", "실패해결"],
          },
          {
            title: "투명 슬라임 기포와 점도 조절 팁",
            post_type: "recipe",
            score: 86,
            excerpt: "글루와 물 비율을 맞춘 뒤 액티베이터는 마지막에 나눠 넣어야 투명도와 점도를 유지하기 쉽습니다.",
            tags: ["투명슬라임", "액티베이터", "레시피"],
          },
        ],
      }
    : null;

  const products = route.includes("mcp")
    ? {
        query: message,
        inferred_materials: ["클리어 PVA 글루", "슬라임 액티베이터", "보관 용기"],
        adapter: "frontend-demo-mcp-adapter",
        items: [
          {
            material: "클리어 PVA 글루",
            search_keyword: "클리어 글루 투명 슬라임 베이스",
            estimated_price: "5,000원 ~ 9,000원",
            source: "demo",
            link: "https://search.shopping.naver.com/search/all?query=%ED%81%B4%EB%A6%AC%EC%96%B4+%EA%B8%80%EB%A3%A8",
          },
          {
            material: "슬라임 액티베이터",
            search_keyword: "슬라임 액티베이터 붕사수",
            estimated_price: "3,000원 ~ 7,000원",
            source: "demo",
            link: "https://search.shopping.naver.com/search/all?query=%EC%8A%AC%EB%9D%BC%EC%9E%84+%EC%95%A1%ED%8B%B0%EB%B2%A0%EC%9D%B4%ED%84%B0",
          },
        ],
      }
    : null;

  return {
    route,
    tool_calls: [
      ...(rag ? ["rag.search_internal_posts"] : []),
      ...(products ? ["mcp.search_products"] : []),
    ],
    answer:
      route === "rag+mcp"
        ? "비슷한 실패 사례를 먼저 확인한 뒤, 필요한 재료는 외부 도구 결과 기준으로 준비하면 됩니다."
        : route === "mcp"
          ? "요청에는 재료나 구매 정보가 중요하므로 외부 도구 결과를 우선 확인합니다."
          : "요청에는 제작법이나 실패 해결 맥락이 중요하므로 내부 게시글 근거를 우선 확인합니다.",
    rag,
    products,
    recommended_tags: ["AI도움", "클리어슬라임", "끈적임", route.includes("mcp") ? "재료구매" : "실패해결"],
  };
}

export default function AgentDiagnosisPage() {
  const [message, setMessage] = useState(examples[2]);
  const [result, setResult] = useState<AgentRouteResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function runAgent(nextMessage = message) {
    const cleanMessage = nextMessage.trim() || examples[2];
    setIsLoading(true);
    setError("");
    try {
      const response = await routeAgent(cleanMessage);
      setResult(response);
    } catch {
      setError("백엔드 연결이 없어 프론트 데모 결과를 표시합니다.");
      setResult(buildDemoResult(cleanMessage));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    runAgent(examples[2]);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAgent();
  }

  const currentRoute = result ? routeMeta[result.route] : routeMeta["rag+mcp"];
  const ragItems = result?.rag?.items || [];
  const productItems = result?.products?.items || [];

  return (
    <section className={pageStack}>
      <div className={sectionTitleRow}>
        <div className={pageHeader}>
          <span className={cn(badgeBase, badgeTone.coral, "justify-self-start")}>AI Agent</span>
          <h1 className={h1}>Agent가 RAG와 MCP를 함께 사용합니다</h1>
          <p className={muted}>
            사용자의 질문을 보고 내부 게시글 검색과 외부 도구 호출 중 필요한 기능을 선택한 뒤, 결과를 한 화면에 정리합니다.
          </p>
        </div>
        <Link className={ghostButton} to="/posts">게시판 보기</Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form className={cn(panelCard, "grid gap-4 p-5")} onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-base font-bold text-ink">사용자 요청</span>
            <textarea
              className={textarea}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="예: 클리어 슬라임이 너무 끈적이고 손에 계속 묻어요"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {examples.map((item) => (
              <button
                className="rounded-md border border-line bg-white px-3 py-2 text-left text-base font-medium text-muted transition hover:border-mint/50 hover:bg-mint-soft hover:text-mint-dark"
                type="button"
                onClick={() => {
                  setMessage(item);
                  runAgent(item);
                }}
                key={item}
              >
                {item}
              </button>
            ))}
            <button className={button} type="submit" disabled={isLoading}>
              {isLoading ? "분석 중..." : "Agent 실행"}
            </button>
          </div>
        </form>

        <aside className="grid content-start gap-4">
          {capabilities.map((item) => (
            <section className={cn(surfaceCard, "p-4")} key={item.badge}>
              <span className={cn(badgeBase, badgeTone[item.tone])}>{item.badge}</span>
              <h2 className={cn(h3, "mt-3")}>{item.title}</h2>
              <p className={cn(cardCopy, "mt-2")}>{item.copy}</p>
            </section>
          ))}
        </aside>
      </div>

      {error && <p className="rounded-md border border-coral/20 bg-orange-50 p-4 text-base font-bold text-coral">{error}</p>}

      {result && (
        <>
          <section className={cn(panelCard, "grid gap-4 p-5")}>
            <div className={sectionTitleRow}>
              <div>
                <span className={cn(badgeBase, badgeTone[currentRoute.tone])}>선택된 경로</span>
                <h2 className={cn(h2, "mt-2")}>{currentRoute.label}</h2>
                <p className={cardCopy}>{currentRoute.copy}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.tool_calls.map((tool) => (
                  <span className={cn(badgeBase, badgeTone.mint)} key={tool}>{getToolLabel(tool)}</span>
                ))}
              </div>
            </div>
            <p className="leading-relaxed text-ink">{result.answer}</p>
            <div className={tagRow}>
              {result.recommended_tags.map((tag) => <TagBadge label={tag} key={tag} />)}
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className={cn(panelCard, "grid content-start gap-4 p-5")}>
              <div className={sectionTitleRow}>
                <div>
                  <h3 className={h3}>내부 지식 결과</h3>
                  <p className={meta}>RAG가 찾은 게시글 근거</p>
                </div>
                <span className={cn(badgeBase, badgeTone.mint)}>{ragItems.length}건</span>
              </div>
              {ragItems.length ? ragItems.map((item) => (
                <article className="grid gap-2 border-b border-line pb-3 last:border-b-0 last:pb-0" key={`${item.title}-${item.score}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-ink">{item.title}</p>
                    <span className={meta}>관련도 {item.score}%</span>
                  </div>
                  <p className={cardCopy}>{item.excerpt}</p>
                  <div className={tagRow}>
                    {item.tags.map((tag) => <TagBadge label={tag} key={tag} />)}
                  </div>
                </article>
              )) : <p className={muted}>이번 요청에서는 내부 게시글 검색이 필요하지 않습니다.</p>}
            </section>

            <section className={cn(panelCard, "grid content-start gap-4 p-5")}>
              <div className={sectionTitleRow}>
                <div>
                  <h3 className={h3}>외부 도구 결과</h3>
                  <p className={meta}>MCP가 반환한 재료/상품 정보</p>
                </div>
                <span className={cn(badgeBase, badgeTone.lavender)}>{productItems.length}건</span>
              </div>
              {productItems.length ? productItems.map((item) => (
                <article className="grid gap-2 border-b border-line pb-3 last:border-b-0 last:pb-0" key={item.material}>
                  <p className="font-bold text-ink">{item.material}</p>
                  <p className={cardCopy}>{item.search_keyword}</p>
                  <p className={meta}>{item.estimated_price} · {item.source}</p>
                  <a className="text-base font-bold text-mint-dark" href={item.link} target="_blank" rel="noreferrer">
                    검색 링크 열기 →
                  </a>
                </article>
              )) : <p className={muted}>이번 요청에서는 외부 도구 호출이 필요하지 않습니다.</p>}
            </section>
          </div>
        </>
      )}
    </section>
  );
}
