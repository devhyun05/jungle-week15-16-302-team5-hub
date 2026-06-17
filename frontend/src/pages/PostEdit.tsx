import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { checkRestrictedItem } from "../api/ai"
import {
  createPostImage,
  createPresignedUrl,
  uploadImageToS3,
} from "../api/images"
import { getPost, updatePost } from "../api/posts"
import AlertBanner from "../components/AlertBanner"
import PostForm from "../components/PostForm"
import type { FormEvent } from "react"
import type { RestrictedItemCheckResponse } from "../api/ai"
import type { AlertType } from "../components/AlertBanner"
import type { Post, PostCategory, PostStatus } from "../types/post"

type AlertState = {
  type: AlertType
  title: string
  message?: string
}

const PostEdit = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [alert, setAlert] = useState<AlertState | null>(null)
  const [safetyCheck, setSafetyCheck] =
    useState<RestrictedItemCheckResponse | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchPost = async () => {
      if (!postId) {
        setErrorMessage("게시글 주소가 올바르지 않습니다.")
        setIsLoading(false)
        return
      }

      try {
        const post = await getPost(Number(postId))
        if (isMounted) {
          setPost(post)
        }
      } catch {
        if (isMounted) {
          setErrorMessage("수정할 게시글을 불러오지 못했습니다.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchPost()

    return () => {
      isMounted = false
    }
  }, [postId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!postId) {
      setAlert({
        type: "error",
        title: "게시글 주소가 올바르지 않습니다.",
        message: "목록에서 다시 게시글을 선택해주세요.",
      })
      return
    }

    setIsSubmitting(true)
    setAlert(null)
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
        setAlert({
          type: "error",
          title: "거래 안전 검사를 통과하지 못했습니다.",
          message: safetyResult.message,
        })
        return
      }

      const updatedPost = await updatePost(Number(postId), {
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
          postId: updatedPost.id,
          imageUrl: presignedData.image_url,
          objectKey: presignedData.object_key,
        })
      }

      navigate(`/post-details/${updatedPost.id}`, {
        state: {
          alert: {
            type: "success",
            title: "게시글이 수정되었습니다.",
            message: "변경한 내용이 상세 페이지에 반영되었습니다.",
          },
        },
      })
    } catch (error) {
      setAlert({
        type: "error",
        title: "게시글을 수정하지 못했습니다.",
        message:
          error instanceof Error
            ? error.message
            : "입력값과 네트워크 상태를 확인한 뒤 다시 시도해주세요.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-4">
        <div className="rounded-lg border border-gray-300 bg-white py-20 text-center text-sm font-medium text-gray-400">
          수정할 게시글을 불러오고 있습니다.
        </div>
      </section>
    )
  }

  if (errorMessage && !post) {
    return (
      <section className="mx-auto max-w-4xl px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 py-20 text-center text-sm font-medium text-red-500">
          {errorMessage}
        </div>
      </section>
    )
  }

  if (!post) {
    return null
  }

  return (
    <section className="mx-auto max-w-4xl px-4">
      {alert && (
        <AlertBanner
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm text-gray-500">중고 거래 글 수정</p>
          <h1 className="text-2xl font-semibold text-gray-900">판매글 수정</h1>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/post-details/${post.id}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            취소
          </Link>

          <button
            type="submit"
            form="post-edit-form"
            disabled={isSubmitting}
            className="rounded-md bg-[#00C471] px-4 py-2 text-sm font-medium text-white hover:bg-[#00A862] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? "수정 중" : "수정 완료"}
          </button>
        </div>
      </div>

      <PostForm
        mode="edit"
        formId="post-edit-form"
        initialValues={post}
        onSubmit={handleSubmit}
      />

      {safetyCheck && safetyCheck.status !== "allowed" && (
        <div
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
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
        </div>
      )}
    </section>
  )
}

export default PostEdit
