import { useState } from "react"
import { useNavigate } from "react-router"
import { checkRestrictedItem } from "../api/ai"
import {
  createPostImage,
  createPresignedUrl,
  uploadImageToS3,
} from "../api/images"
import { createPost } from "../api/posts"
import PostForm from "../components/PostForm"
import type { FormEvent } from "react"
import type { RestrictedItemCheckResponse } from "../api/ai"
import type { PostCategory, PostStatus } from "../types/post"

const PostCreate = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [safetyCheck, setSafetyCheck] =
    useState<RestrictedItemCheckResponse | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")
    setSafetyCheck(null)

    const formData = new FormData(event.currentTarget)
    const price = String(formData.get("price") ?? "").replaceAll(",", "")
    const imageFile = formData.get("image")
    const title = String(formData.get("title") ?? "")
    const description = String(formData.get("description") ?? "") || null
    const category = String(formData.get("category") ?? "기타") as PostCategory

    try {
      const safetyResult = await checkRestrictedItem({
        title,
        description,
        category,
      })
      setSafetyCheck(safetyResult)

      if (safetyResult.status !== "allowed") {
        setErrorMessage(safetyResult.message)
        return
      }

      const post = await createPost({
        title,
        description,
        price: Number(price),
        trade_location: String(formData.get("trade_location") ?? ""),
        category,
        status: String(formData.get("status") ?? "selling") as PostStatus,
      })

      if (imageFile instanceof File && imageFile.size > 0) {
        const presignedData = await createPresignedUrl(imageFile)
        await uploadImageToS3({
          uploadUrl: presignedData.upload_url,
          file: imageFile,
        })
        await createPostImage({
          postId: post.id,
          imageUrl: presignedData.image_url,
          objectKey: presignedData.object_key,
        })
      }

      navigate(`/post-details/${post.id}`)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "게시글을 등록하지 못했습니다. 잠시 후 다시 시도해주세요.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4">
      {/* 페이지 상단 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm text-gray-500">중고 거래 글 작성</p>
          <h1 className="text-2xl font-semibold text-gray-900">판매글 작성</h1>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            임시저장
          </button>

          <button
            type="submit"
            form="post-create-form"
            disabled={isSubmitting}
            className="rounded-md bg-[#00C471] px-4 py-2 text-sm font-medium text-white hover:bg-[#00A862] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? "등록 중" : "등록"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-500">
          {errorMessage}
        </div>
      )}

      {safetyCheck && safetyCheck.status !== "allowed" && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            safetyCheck.status === "blocked"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <p className="font-semibold">AI 거래 안전 검사</p>
          <p className="mt-1">{safetyCheck.message}</p>

          {safetyCheck.matched_policy_titles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {safetyCheck.matched_policy_titles.map((title) => (
                <span
                  key={title}
                  className="rounded-full bg-white px-2.5 py-1 text-xs font-medium"
                >
                  {title}
                </span>
              ))}
            </div>
          )}

          {safetyCheck.sources.length > 0 && (
            <div className="mt-3 space-y-1 text-xs">
              {safetyCheck.sources.slice(0, 2).map((source) => (
                <a
                  key={source.policy_id}
                  href={source.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block underline underline-offset-2"
                >
                  참고: {source.title}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 작성 폼 */}
      <div>
        <PostForm
          mode="create"
          formId="post-create-form"
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  )
}

export default PostCreate
