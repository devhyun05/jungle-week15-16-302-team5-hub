import { useState } from "react"
import { useNavigate } from "react-router"
import {
  createPostImage,
  createPresignedUrl,
  uploadImageToS3,
} from "../api/images"
import { createPost } from "../api/posts"
import PostForm from "../components/PostForm"
import type { FormEvent } from "react"
import type { PostCategory, PostStatus } from "../types/post"

const PostCreate = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    const formData = new FormData(event.currentTarget)
    const price = String(formData.get("price") ?? "").replaceAll(",", "")
    const imageFile = formData.get("image")

    try {
      const post = await createPost({
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? "") || null,
        price: Number(price),
        trade_location: String(formData.get("trade_location") ?? ""),
        category: String(formData.get("category") ?? "기타") as PostCategory,
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
    } catch {
      setErrorMessage("게시글을 등록하지 못했습니다. 잠시 후 다시 시도해주세요.")
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
