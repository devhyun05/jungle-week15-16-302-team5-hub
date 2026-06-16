import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router"
import CommentList from "../components/CommentList"
import { sendSlackTradeAlert } from "../api/ai"
import { deletePost, getPost } from "../api/posts"
import AlertBanner from "../components/AlertBanner"
import ConfirmDialog from "../components/ConfirmDialog"
import { useMockAuth } from "../lib/mockAuth"
import type { AlertType } from "../components/AlertBanner"
import type { Post, PostStatus } from "../types/post"

type AlertState = {
  type: AlertType
  title: string
  message?: string
}

const statusLabel: Record<PostStatus, string> = {
  selling: "판매중",
  reserved: "예약중",
  sold: "거래완료",
}

const formatPrice = (price: number) => `${price.toLocaleString("ko-KR")}원`

const formatTime = (createdAt: string) => {
  const createdTime = new Date(createdAt).getTime()
  const diffMinutes = Math.floor((Date.now() - createdTime) / 1000 / 60)

  if (diffMinutes < 1) return "방금 전"
  if (diffMinutes < 60) return `${diffMinutes}분 전`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}시간 전`

  return `${Math.floor(diffHours / 24)}일 전`
}

const PostDetailPage = () => {
  const { postId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useMockAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSendingSlackAlert, setIsSendingSlackAlert] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [alert, setAlert] = useState<AlertState | null>(null)

  useEffect(() => {
    const routeState = location.state as { alert?: AlertState } | null
    if (!routeState?.alert) {
      return
    }

    setAlert(routeState.alert)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    let isMounted = true

    const fetchPost = async () => {
      if (!postId) {
        setErrorMessage("게시글 주소가 올바르지 않습니다.")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage("")

      try {
        const post = await getPost(Number(postId))
        if (isMounted) {
          setPost(post)
        }
      } catch {
        if (isMounted) {
          setErrorMessage("게시글을 불러오지 못했습니다.")
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

  const isOwner = Boolean(user && post && user.id === post.seller_id)

  const handleDeletePost = () => {
    if (!post) {
      return
    }

    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDeletePost = async () => {
    if (!post) {
      return
    }

    setIsDeleting(true)
    setAlert(null)

    try {
      await deletePost(post.id)
      navigate("/profile", {
        state: {
          alert: {
            type: "success",
            title: "게시글이 삭제되었습니다.",
            message: "내가 쓴 글 목록에서 해당 게시글을 제거했습니다.",
          },
        },
      })
    } catch {
      setAlert({
        type: "error",
        title: "게시글을 삭제하지 못했습니다.",
        message: "권한 또는 네트워크 상태를 확인한 뒤 다시 시도해주세요.",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleSendSlackAlert = async () => {
    if (!post) {
      return
    }

    setIsSendingSlackAlert(true)
    setAlert(null)

    try {
      const result = await sendSlackTradeAlert(post.id)
      setAlert({
        type: result.status === "failed" ? "error" : "success",
        title:
          result.status === "sent"
            ? "Slack 거래 알림을 보냈습니다."
            : "Slack 거래 알림 preview를 만들었습니다.",
        message: result.message,
      })
    } catch {
      setAlert({
        type: "error",
        title: "Slack 거래 알림을 보내지 못했습니다.",
        message: "로그인 상태와 Slack 설정을 확인해주세요.",
      })
    } finally {
      setIsSendingSlackAlert(false)
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4">
        <div className="rounded-lg border border-gray-300 bg-white py-20 text-center text-sm font-medium text-gray-400">
          게시글을 불러오고 있습니다.
        </div>
      </section>
    )
  }

  if (!post) {
    return (
      <section className="mx-auto max-w-7xl px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 py-20 text-center text-sm font-medium text-red-500">
          {errorMessage || "게시글을 찾을 수 없습니다."}
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4">
      {alert && (
        <AlertBanner
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="게시글을 삭제할까요?"
        description="삭제하면 일반 목록과 상세 화면에서 더 이상 보이지 않습니다."
        confirmLabel="삭제하기"
        isLoading={isDeleting}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDeletePost}
      />

      <div className="mb-4">
        <Link
          to="/"
          className="text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <article className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
            <div className="flex h-96 items-center justify-center overflow-hidden border-b border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
              {post.images[0] ? (
                <img
                  src={post.images[0].image_url}
                  alt=""
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-300 shadow-sm">
                  <svg
                    className="h-9 w-9"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M4 16l4.5-4.5a2 2 0 0 1 2.8 0L16 16m-2-2 1.5-1.5a2 2 0 0 1 2.8 0L20 14m-16 5h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-11h.01"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-500">
                  {post.category}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {statusLabel[post.status]}
                </span>
              </div>

              {isOwner && (
                <div className="mb-5 flex flex-wrap gap-2">
                  <Link
                    to={`/post-edit/${post.id}`}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
                  >
                    수정
                  </Link>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDeletePost}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? "삭제 중" : "삭제"}
                  </button>
                </div>
              )}

              <h1 className="text-2xl font-semibold text-gray-900">
                {post.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>판매자 #{post.seller_id}</span>
                <span>·</span>
                <span>{post.trade_location}</span>
                <span>·</span>
                <span>{formatTime(post.created_at)}</span>
              </div>

              <p className="mt-6 text-3xl font-semibold text-gray-950">
                {formatPrice(post.price)}
              </p>

              <p className="mt-6 whitespace-pre-wrap leading-7 text-gray-600">
                {post.description || "작성된 설명이 없습니다."}
              </p>

              <div className="mt-8 border-t border-dashed border-gray-300 pt-4">
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>♡ {post.like_count}</span>
                  <span>💬 {post.comment_count}</span>
                  <span>조회 {post.view_count}</span>
                </div>
              </div>
            </div>
          </article>

          <CommentList postId={post.id} />
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">판매자</h2>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                {String(post.seller_id).slice(0, 1)}
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  판매자 #{post.seller_id}
                </p>
                <p className="text-sm text-gray-500">정글 구성원</p>
              </div>
            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              프로필 보기
            </button>

            {isOwner && (
              <button
                type="button"
                disabled={isSendingSlackAlert}
                onClick={handleSendSlackAlert}
                className="mt-2 w-full rounded-md bg-[#00C471] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00A862] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSendingSlackAlert ? "알림 전송 중" : "Slack 거래 알림 보내기"}
              </button>
            )}
          </section>
        </aside>
      </div>
    </section>
  )
}

export default PostDetailPage
