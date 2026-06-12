import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPosts } from "../api/posts";
import { fetchPopularTags } from "../api/tags";
import PostCard from "../components/PostCard";
import TagBadge from "../components/TagBadge";
import type { Post, PostCardData, PostListResponse, PostType, TagListResponse } from "../types";
import {
  button,
  cn,
  field,
  ghostButton,
  h1,
  h3,
  iconBase,
  iconTone,
  meta,
  muted,
  pageHeader,
  pageStack,
  sectionTitleRow,
  surfaceCard,
} from "../styles/ui";

interface Category {
  label: string;
  description: string;
  icon: string;
  value: PostType | "";
}

const categories: Category[] = [
  { label: "전체", description: "모든 게시글", icon: "A", value: "" },
  { label: "레시피 공유", description: "슬라임 제작 레시피", icon: "R", value: "recipe" },
  { label: "실패 질문", description: "실패 원인 질문과 해결", icon: "Q", value: "failure" },
  { label: "후기", description: "제작 결과 후기", icon: "V", value: "review" },
  { label: "일반", description: "팁과 자유 글", icon: "G", value: "general" },
];

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
    <div className="flex items-center justify-center gap-3">
      <button
        className="inline-flex min-h-9 items-center rounded-full border border-line bg-white px-4 text-base font-bold text-muted transition hover:border-mint/50 hover:text-mint-dark disabled:cursor-not-allowed disabled:opacity-40"
        type="button"
        disabled={isFirst}
        onClick={() => onChange(page - 1)}
      >
        이전
      </button>
      <span className="inline-flex min-h-9 items-center rounded-full bg-mint px-4 text-base font-bold text-white">
        {page} / {totalPages}
      </span>
      <button
        className="inline-flex min-h-9 items-center rounded-full border border-line bg-white px-4 text-base font-bold text-muted transition hover:border-mint/50 hover:text-mint-dark disabled:cursor-not-allowed disabled:opacity-40"
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [postType, setPostType] = useState<PostType | "">("");
  const [selectedTag, setSelectedTag] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.value === postType) || categories[0],
    [postType],
  );

  useEffect(() => {
    let ignore = false;
    async function loadTags() {
      try {
        const response = await fetchPopularTags<TagListResponse>();
        if (!ignore) {
          setPopularTags(response.items.map((tag) => tag.name).slice(0, 10));
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
          tag: selectedTag || undefined,
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
  }, [page, postType, selectedTag, submittedKeyword]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedKeyword(keyword.trim());
    setPage(1);
  }

  function chooseType(value: PostType | "") {
    setPostType(value);
    setPage(1);
  }

  function chooseTag(tag: string) {
    setSelectedTag((current) => (current === tag ? "" : tag));
    setPage(1);
  }

  return (
    <section className={pageStack}>
      <div className={sectionTitleRow}>
        <div className={pageHeader}>
          <h1 className={h1}>슬라임 연구 게시판</h1>
          <p className={muted}>게시글 {total.toLocaleString()}개 · {selectedCategory.label} 보기</p>
        </div>
        <Link to="/posts/new" className={button}>글쓰기</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {categories.map((category) => {
          const selected = category.value === postType;
          return (
            <button
              className={cn(surfaceCard, "flex items-center gap-3.5 text-left transition hover:border-mint/50", selected && "border-mint bg-mint-soft")}
              key={category.label}
              type="button"
              onClick={() => chooseType(category.value)}
            >
              <span className={cn(iconBase, selected ? iconTone.mint : iconTone.lavender)}>{category.icon}</span>
              <span>
                <span className={h3}>{category.label}</span>
                <span className={meta}>{category.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <form className={surfaceCard} onSubmit={handleSearch}>
        <div className="flex items-center gap-3 max-md:flex-col max-md:items-stretch">
          <input
            className={field}
            aria-label="게시글 검색"
            placeholder="제목, 내용, 증상 검색"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button className={ghostButton} type="submit">검색</button>
          <button
            className={ghostButton}
            type="button"
            onClick={() => {
              setKeyword("");
              setSubmittedKeyword("");
              setSelectedTag("");
              setPostType("");
              setPage(1);
            }}
          >
            초기화
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => chooseTag("")}>
          <TagBadge label="전체" selected={!selectedTag} />
        </button>
        {popularTags.map((tag) => (
          <button type="button" onClick={() => chooseTag(tag)} key={tag}>
            <TagBadge label={tag} selected={selectedTag === tag} />
          </button>
        ))}
      </div>

      {message && <p className="rounded-lg border border-coral/20 bg-coral/10 p-4 font-bold text-coral">{message}</p>}
      {isLoading && <p className={muted}>게시글을 불러오는 중입니다.</p>}

      {!isLoading && posts.length === 0 ? (
        <div className={surfaceCard}>
          <p className="font-extrabold text-ink">검색 결과가 없어요.</p>
          <p className={muted}>다른 태그나 검색어로 다시 찾아보세요.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={toCardData(post)} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </section>
  );
}
