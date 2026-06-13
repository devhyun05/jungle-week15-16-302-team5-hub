import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchPosts } from "../api/posts";
import { fetchPopularTags } from "../api/tags";
import PostCard from "../components/PostCard";
import TagBadge from "../components/TagBadge";
import type { Post, PostCardData, PostListResponse, PostType, TagListResponse } from "../types";
import {
  badgeBase,
  badgeTone,
  button,
  cn,
  field,
  ghostButton,
  h1,
  muted,
  pageHeader,
  pageStack,
  sectionTitleRow,
  surfaceCard,
} from "../styles/ui";

interface Category {
  label: string;
  description: string;
  value: PostType | "";
}

const categories: Category[] = [
  { label: "전체", description: "모든 글 보기", value: "" },
  { label: "레시피 공유", description: "직접 만든 레시피", value: "recipe" },
  { label: "실패 질문", description: "실패 원인 질문", value: "failure" },
  { label: "후기", description: "구매/제작 후기", value: "review" },
  { label: "일반", description: "그 외 자유 글", value: "general" },
];

function isPostType(value: string | null): value is PostType {
  return value === "recipe" || value === "failure" || value === "review" || value === "general";
}

function uniqueTags(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function readTags(params: URLSearchParams) {
  return uniqueTags([...params.getAll("tags"), params.get("tag") || ""]);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(new Date(value));
}

function toCardData(post: Post): PostCardData {
  return {
    id: post.id,
    type: post.post_type,
    title: post.title,
    summary: post.summary,
    tags: post.tags,
    author: post.author.nickname,
    time: formatDate(post.created_at),
    comments: post.comment_count,
    isOwner: post.is_owner,
  };
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        className="inline-flex min-h-10 items-center rounded-md border border-line bg-white px-3 text-base font-bold text-muted transition hover:border-mint/50 hover:text-mint-dark disabled:cursor-not-allowed disabled:opacity-40"
        type="button"
        disabled={isFirst}
        onClick={() => onChange(page - 1)}
      >
        이전
      </button>
      <span className="inline-flex min-h-10 items-center rounded-md border border-mint bg-mint-soft px-3 text-base font-bold text-mint-dark">
        {page} / {totalPages}
      </span>
      <button
        className="inline-flex min-h-10 items-center rounded-md border border-line bg-white px-3 text-base font-bold text-muted transition hover:border-mint/50 hover:text-mint-dark disabled:cursor-not-allowed disabled:opacity-40"
        type="button"
        disabled={isLast}
        onClick={() => onChange(page + 1)}
      >
        다음
      </button>
    </div>
  );
}

export default function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get("keyword") || "";
  const initialType = searchParams.get("type");
  const initialTags = readTags(searchParams);
  const [posts, setPosts] = useState<Post[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [submittedKeyword, setSubmittedKeyword] = useState(initialKeyword);
  const [postType, setPostType] = useState<PostType | "">(isPostType(initialType) ? initialType : "");
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.value === postType) || categories[0],
    [postType],
  );
  const hasActiveFilters = Boolean(submittedKeyword || postType || selectedTags.length);
  const filterSummary = [
    `게시글 ${total.toLocaleString()}개`,
    selectedCategory.label,
    ...selectedTags.map((tag) => `#${tag}`),
  ].join(" · ");

  useEffect(() => {
    const nextKeyword = searchParams.get("keyword") || "";
    const nextType = searchParams.get("type");
    const nextTags = readTags(searchParams);
    setKeyword(nextKeyword);
    setSubmittedKeyword(nextKeyword);
    setPostType(isPostType(nextType) ? nextType : "");
    setSelectedTags(nextTags);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;
    async function loadTags() {
      try {
        const response = await fetchPopularTags<TagListResponse>();
        if (!ignore) {
          setPopularTags(response.items.map((tag) => tag.name).slice(0, 8));
        }
      } catch {
        if (!ignore) {
          setPopularTags(["클리어슬라임", "버터슬라임", "끈적임", "거품", "실패해결"]);
        }
      }
    }
    loadTags();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadPosts() {
      setIsLoading(true);
      setMessage("");
      try {
        const response = await fetchPosts<PostListResponse>({
          page,
          size: 10,
          keyword: submittedKeyword || undefined,
          post_type: postType || undefined,
          tags: selectedTags.length ? selectedTags : undefined,
        });
        if (!ignore) {
          setPosts(response.items);
          setTotal(response.total);
          setTotalPages(response.total_pages);
        }
      } catch (error) {
        if (!ignore) {
          setMessage(error instanceof Error ? error.message : "게시글을 불러오지 못했습니다.");
          setPosts([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    loadPosts();
    return () => {
      ignore = true;
    };
  }, [page, postType, selectedTags, submittedKeyword]);

  function syncFilters(next: { keyword?: string; postType?: PostType | ""; tags?: string[] }) {
    const nextKeyword = next.keyword ?? submittedKeyword;
    const nextPostType = next.postType ?? postType;
    const nextTags = next.tags ?? selectedTags;
    const params = new URLSearchParams();
    if (nextKeyword) {
      params.set("keyword", nextKeyword);
    }
    if (nextPostType) {
      params.set("type", nextPostType);
    }
    uniqueTags(nextTags).forEach((tag) => params.append("tags", tag));
    setSearchParams(params, { replace: true });
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanKeyword = keyword.trim();
    setSubmittedKeyword(cleanKeyword);
    setPage(1);
    syncFilters({ keyword: cleanKeyword });
  }

  function chooseType(value: PostType | "") {
    setPostType(value);
    setPage(1);
    syncFilters({ postType: value });
  }

  function chooseTag(tag: string) {
    const nextTags = selectedTags.includes(tag)
      ? selectedTags.filter((item) => item !== tag)
      : [...selectedTags, tag];
    setSelectedTags(nextTags);
    setPage(1);
    syncFilters({ tags: nextTags });
  }

  function clearTags() {
    setSelectedTags([]);
    setPage(1);
    syncFilters({ tags: [] });
  }

  function resetFilters() {
    setKeyword("");
    setSubmittedKeyword("");
    setSelectedTags([]);
    setPostType("");
    setPage(1);
    setSearchParams({}, { replace: true });
  }

  return (
    <section className={pageStack}>
      <section className="relative overflow-hidden rounded-md border border-line bg-white px-6 py-8 shadow-subtle md:px-9 md:py-10">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-mint" aria-hidden="true" />
        <div className="grid max-w-[820px] gap-5">
          <span className={cn(badgeBase, badgeTone.mint, "justify-self-start")}>말랑 연구소</span>
          <div className="grid gap-3">
            <h1 className="text-[38px] font-bold leading-tight text-ink md:text-[54px]">말랑 연구소 게시판입니다.</h1>
            <p className="max-w-[760px] text-xl leading-relaxed text-[#475467] md:text-[22px]">
              직접 만든 레시피, 실패 질문, 구매하거나 따라 만든 후기를 한곳에서 찾고 함께 나눕니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-base font-bold text-mint-dark">
            <span className="rounded-md bg-mint-soft px-3 py-2">레시피 공유</span>
            <span className="rounded-md bg-mint-soft px-3 py-2">실패 질문</span>
            <span className="rounded-md bg-mint-soft px-3 py-2">후기</span>
            <span className="rounded-md bg-mint-soft px-3 py-2">자유 글</span>
          </div>
        </div>
      </section>

      <div className={sectionTitleRow}>
        <div className={pageHeader}>
          <p className={muted}>{filterSummary}</p>
        </div>
        <Link to="/posts/new" className={cn(button, "!w-auto self-start justify-self-start")}>글쓰기</Link>
      </div>

      <section className={cn(surfaceCard, "grid gap-4")}>
        <form className="flex items-center gap-2 max-md:flex-col max-md:items-stretch" onSubmit={handleSearch}>
          <input
            className={field}
            aria-label="게시글 검색"
            placeholder="제목, 내용, 증상 검색"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button className={cn(ghostButton, "shrink-0")} type="submit">검색</button>
          {hasActiveFilters && (
            <button className={cn(ghostButton, "shrink-0")} type="button" onClick={resetFilters}>
              초기화
            </button>
          )}
        </form>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const selected = category.value === postType;
            return (
              <button
                aria-label={`${category.label}: ${category.description}`}
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-base transition",
                  selected
                    ? "border-mint bg-mint-soft text-mint-dark"
                    : "border-line bg-white text-muted hover:border-mint/50 hover:text-mint-dark",
                )}
                key={category.label}
                type="button"
                onClick={() => chooseType(category.value)}
              >
                <strong className="block text-base">{category.label}</strong>
                <span className="text-sm max-md:hidden">{category.description}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <button type="button" onClick={clearTags}>
            <TagBadge label="전체" selected={selectedTags.length === 0} />
          </button>
          {popularTags.map((tag) => (
            <button type="button" onClick={() => chooseTag(tag)} key={tag}>
              <TagBadge label={tag} selected={selectedTags.includes(tag)} />
            </button>
          ))}
        </div>
      </section>

      <div className="grid content-start gap-3">
        {message && <p className="rounded-md border border-coral/20 bg-orange-50 p-4 text-base font-bold text-coral">{message}</p>}
        {isLoading && <p className={muted}>게시글을 불러오는 중입니다.</p>}

        {!isLoading && posts.length === 0 ? (
          <div className={surfaceCard}>
            <p className="font-bold text-ink">검색 결과가 없어요.</p>
            <p className={muted}>다른 태그나 검색어로 다시 찾아보세요.</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={toCardData(post)} />
          ))
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </section>
  );
}
