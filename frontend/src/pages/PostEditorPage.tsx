import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
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

const categoryBase =
  "grid min-h-[74px] content-center rounded-md border px-3 py-2 text-left transition";
const categoryNeutral = "border-line bg-white text-muted hover:border-mint/50 hover:text-mint-dark";
const categorySelected = "border-mint bg-mint-soft text-mint-dark";

const postTypes: Array<{ label: string; description: string; value: PostType }> = [
  { label: "레시피 공유", description: "직접 만든 느낌 좋은 레시피", value: "recipe" },
  { label: "실패 질문", description: "만들다 실패한 이유 질문", value: "failure" },
  { label: "후기", description: "구매하거나 따라 만든 후기", value: "review" },
  { label: "일반", description: "그 외 자유 글", value: "general" },
];

const maxImageFileSize = 1_000_000;
const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface FormState {
  title: string;
  content: string;
  post_type: PostType;
  slime_type: string;
  image_url: string;
  tag_names: string[];
}

const initialForm: FormState = {
  title: "",
  content: "",
  post_type: "failure",
  slime_type: "",
  image_url: "",
  tag_names: [],
};

export default function PostEditorPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(postId);
  const [form, setForm] = useState<FormState>(initialForm);
  const [tags, setTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageInputKey, setImageInputKey] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const knownTags = useMemo(
    () => Array.from(new Set([...customTags, ...tags])),
    [customTags, tags],
  );

  const slimeTypes = useMemo(
    () => knownTags.filter((tag) => tag.includes("슬라임")).slice(0, 8),
    [knownTags],
  );

  const suggestedTags = useMemo(
    () => knownTags.filter((tag) => !form.tag_names.includes(tag)).slice(0, 24),
    [form.tag_names, knownTags],
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
            image_url: post.image_url || "",
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
      if (!exists && current.tag_names.length >= 8) {
        setMessage("태그는 최대 8개까지 추가할 수 있어요.");
        return current;
      }
      setMessage("");
      return {
        ...current,
        tag_names: exists
          ? current.tag_names.filter((item) => item !== tag)
          : [...current.tag_names, tag].slice(0, 8),
      };
    });
  }

  function removeTag(tag: string) {
    setMessage("");
    setForm((current) => ({
      ...current,
      tag_names: current.tag_names.filter((item) => item !== tag),
    }));
    if (!tags.includes(tag)) {
      setCustomTags((current) => current.filter((item) => item !== tag));
    }
  }

  function normalizeTag(value: string) {
    return value.trim().replace(/^#+/, "").replace(/\s+/g, "");
  }

  function addTag() {
    const nextTag = normalizeTag(tagInput);
    if (!nextTag) {
      return;
    }
    if (form.tag_names.includes(nextTag)) {
      setMessage("");
      setTagInput("");
      return;
    }
    if (form.tag_names.length >= 8) {
      setMessage("태그는 최대 8개까지 추가할 수 있어요.");
      return;
    }
    setMessage("");
    updateForm("tag_names", [...form.tag_names, nextTag]);
    if (!knownTags.includes(nextTag)) {
      setCustomTags((current) => [nextTag, ...current]);
    }
    setTagInput("");
  }

  function handleTagInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!acceptedImageTypes.includes(file.type)) {
      setMessage("JPG, PNG, WebP, GIF 이미지만 첨부할 수 있어요.");
      setImageInputKey((current) => current + 1);
      return;
    }

    if (file.size > maxImageFileSize) {
      setMessage("사진은 1MB 이하만 첨부할 수 있어요.");
      setImageInputKey((current) => current + 1);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateForm("image_url", reader.result);
        setMessage("");
      }
    };
    reader.onerror = () => {
      setMessage("사진을 읽지 못했습니다.");
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    updateForm("image_url", "");
    setImageInputKey((current) => current + 1);
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        slime_type: form.slime_type || null,
        image_url: form.image_url || null,
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
      <div className={cn(pageHeader, "mx-auto w-full max-w-[820px]")}>
        <h1 className={h1}>{isEdit ? "게시글 수정" : "새 게시글 작성"}</h1>
        <p className={muted}>제목, 본문, 유형, 태그를 정리해 다른 사용자가 빠르게 이해할 수 있게 작성하세요.</p>
      </div>

      <form className="mx-auto grid w-full max-w-[820px] gap-6 rounded-md border border-line bg-white p-5 shadow-subtle md:p-7" onSubmit={handleSubmit}>
        <div className={formGroup}>
          <span className={formLabel}>카테고리</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {postTypes.map((type) => {
              const selected = form.post_type === type.value;
              return (
                <button
                  aria-label={`${type.label}: ${type.description}`}
                  className={cn(categoryBase, selected ? categorySelected : categoryNeutral)}
                  key={type.value}
                  type="button"
                  onClick={() => updateForm("post_type", type.value)}
                >
                  <strong className={cn("text-base", selected ? "text-mint-dark" : "text-ink")}>
                    {type.label}
                  </strong>
                  <span className="text-[15px] font-medium leading-relaxed">{type.description}</span>
                </button>
              );
            })}
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
          <span className={formLabel}>슬라임 사진</span>
          <input
            key={imageInputKey}
            className={cn(field, "file:mr-4 file:rounded-md file:border-0 file:bg-mint-soft file:px-3 file:py-2 file:text-base file:font-bold file:text-mint-dark")}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
          />
          {form.image_url && (
            <div className="grid gap-3 rounded-md border border-line bg-page/70 p-3">
              <div className="aspect-[16/9] overflow-hidden rounded-md border border-line bg-white">
                <img
                  className="h-full w-full object-contain"
                  src={form.image_url}
                  alt="첨부한 슬라임 사진"
                />
              </div>
              <button className={ghostButton} type="button" onClick={removeImage}>
                사진 삭제
              </button>
            </div>
          )}
          <span className={meta}>JPG, PNG, WebP, GIF / 최대 1MB</span>
        </div>

        <div className={formGroup}>
          <span className={formLabel}>태그</span>
          <div className="flex gap-2 max-md:flex-col">
            <input
              className={field}
              aria-label="태그 직접 추가"
              placeholder="태그를 직접 입력하세요"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={handleTagInputKeyDown}
            />
            <button className={cn(ghostButton, "shrink-0")} type="button" onClick={addTag}>태그 추가</button>
          </div>
          {form.tag_names.length > 0 && (
            <div className="grid gap-2 rounded-md border border-line bg-page/70 p-3">
              <span className={meta}>선택한 태그</span>
              <div className="flex flex-wrap gap-2">
                {form.tag_names.map((tag) => (
                  <span
                    className="inline-flex min-h-9 items-center rounded-md border border-mint bg-mint-soft px-3 text-base font-bold text-mint-dark"
                    key={tag}
                  >
                    #{tag}
                    <button
                      aria-label={`${tag} 태그 삭제`}
                      className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-black text-mint-dark transition hover:bg-mint hover:text-white"
                      type="button"
                      onClick={() => removeTag(tag)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <button type="button" onClick={() => toggleTag(tag)} key={tag}>
                <TagBadge label={tag} />
              </button>
            ))}
          </div>
          <span className={meta}>태그는 직접 추가하거나 선택할 수 있고, 선택한 태그는 옆의 × 버튼으로 삭제합니다.</span>
        </div>

        {message && <p className="rounded-md border border-coral/20 bg-orange-50 p-3 text-base font-bold text-coral">{message}</p>}

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
