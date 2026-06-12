import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchTags } from "../api/tags";
import { createPost, fetchPost, updatePost } from "../api/posts";
import TagBadge from "../components/TagBadge";
import type { Post, PostType, TagListResponse } from "../types";
import {
  button,
  cn,
  field,
  formGroup,
  formLabel,
  ghostButton,
  h1,
  meta,
  muted,
  pageHeader,
  pageStack,
  textarea,
} from "../styles/ui";

const chipBase =
  "inline-flex min-h-8 items-center rounded-full border px-3.5 text-base font-bold leading-none transition";
const chipNeutral = "border-line bg-white text-muted hover:border-mint/50 hover:text-mint-dark";
const chipSelected = "border-mint bg-mint text-white";

const postTypes: Array<{ label: string; value: PostType }> = [
  { label: "레시피 공유", value: "recipe" },
  { label: "실패 질문", value: "failure" },
  { label: "후기", value: "review" },
  { label: "일반", value: "general" },
];

interface FormState {
  title: string;
  content: string;
  post_type: PostType;
  slime_type: string;
  tag_names: string[];
}

const initialForm: FormState = {
  title: "",
  content: "",
  post_type: "failure",
  slime_type: "",
  tag_names: [],
};

export default function PostEditorPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(postId);
  const [form, setForm] = useState<FormState>(initialForm);
  const [tags, setTags] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slimeTypes = useMemo(
    () => tags.filter((tag) => tag.includes("슬라임")).slice(0, 8),
    [tags],
  );

  useEffect(() => {
    let ignore = false;
    async function loadTags() {
      try {
        const response = await fetchTags<TagListResponse>();
        if (!ignore) {
          setTags(response.items.map((tag) => tag.name));
        }
      } catch {
        if (!ignore) {
          setTags(["클리어슬라임", "버터슬라임", "크런치슬라임", "끈적임", "거품", "실패해결"]);
        }
      }
    }
    loadTags();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!postId) {
      return;
    }
    const id = postId;
    let ignore = false;
    async function loadPost() {
      try {
        const post = await fetchPost<Post>(id);
        if (!ignore) {
          setForm({
            title: post.title,
            content: post.content,
            post_type: post.post_type,
            slime_type: post.slime_type || "",
            tag_names: post.tags,
          });
        }
      } catch (error) {
        if (!ignore) {
          setMessage(error instanceof Error ? error.message : "게시글을 불러오지 못했습니다.");
        }
      }
    }
    loadPost();
    return () => {
      ignore = true;
    };
  }, [postId]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleTag(tag: string) {
    setForm((current) => {
      const exists = current.tag_names.includes(tag);
      return {
        ...current,
        tag_names: exists
          ? current.tag_names.filter((item) => item !== tag)
          : [...current.tag_names, tag].slice(0, 8),
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        slime_type: form.slime_type || null,
      };
      const post = isEdit && postId
        ? await updatePost<Post>(postId, payload)
        : await createPost<Post>(payload);
      navigate(`/posts/${post.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "게시글 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={pageStack}>
      <div className={cn(pageHeader, "mx-auto text-center")}>
        <h1 className={h1}>{isEdit ? "게시글 수정" : "새 게시글 작성"}</h1>
        <p className={muted}>필수 게시판 기능에 맞춰 제목, 본문, 유형, 태그를 저장합니다.</p>
      </div>

      <form className="mx-auto grid w-full max-w-[760px] gap-6 rounded-lg border border-line bg-white p-7 shadow-subtle" onSubmit={handleSubmit}>
        <div className={formGroup}>
          <span className={formLabel}>카테고리</span>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {postTypes.map((type) => (
              <button
                className={cn(chipBase, form.post_type === type.value ? chipSelected : chipNeutral)}
                key={type.value}
                type="button"
                onClick={() => updateForm("post_type", type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <label className={formGroup}>
          <span className={formLabel}>제목</span>
          <input
            className={field}
            placeholder="게시글 제목을 입력하세요"
            value={form.title}
            onChange={(event) => updateForm("title", event.target.value)}
            required
          />
        </label>

        <label className={formGroup}>
          <span className={formLabel}>슬라임 종류</span>
          <select
            className={field}
            value={form.slime_type}
            onChange={(event) => updateForm("slime_type", event.target.value)}
          >
            <option value="">선택 안 함</option>
            {slimeTypes.map((tag) => (
              <option value={tag} key={tag}>{tag}</option>
            ))}
          </select>
        </label>

        <label className={formGroup}>
          <span className={formLabel}>본문</span>
          <textarea
            className={textarea}
            placeholder="레시피, 과정, 결과, 질문을 자세히 적어주세요."
            value={form.content}
            onChange={(event) => updateForm("content", event.target.value)}
            required
          />
        </label>

        <div className={formGroup}>
          <span className={formLabel}>태그</span>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {tags.slice(0, 24).map((tag) => (
              <button type="button" onClick={() => toggleTag(tag)} key={tag}>
                <TagBadge label={tag} selected={form.tag_names.includes(tag)} />
              </button>
            ))}
          </div>
          <span className={meta}>초기 태그 중 최대 8개까지 선택할 수 있어요.</span>
        </div>

        {message && <p className="rounded-lg border border-coral/20 bg-coral/10 p-3 text-base font-bold text-coral">{message}</p>}

        <div className="flex items-center justify-center gap-3 max-md:flex-col max-md:items-stretch">
          <Link className={ghostButton} to={postId ? `/posts/${postId}` : "/posts"}>취소</Link>
          <button className={button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : isEdit ? "게시글 수정" : "게시글 등록"}
          </button>
        </div>
      </form>
    </section>
  );
}
