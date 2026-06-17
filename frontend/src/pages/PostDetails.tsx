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

const ALERT_AUTO_CLOSE_MS = 4000
const DEFAULT_INQUIRY_MESSAGE =
  "안녕하세요. 아직 거래 가능할까요? 확인 부탁드립니다."

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
  const routeState = location.state as { alert?: AlertState } | null
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSendingSlackAlert, setIsSendingSlackAlert] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isInquiryDialogOpen, setIsInquiryDialogOpen] = useState(false)
  const [inquiryMessage, setInquiryMessage] = useState(DEFAULT_INQUIRY_MESSAGE)
  const [errorMessage, setErrorMessage] = useState("")
  const [alert, setAlert] = useState<AlertState | null>(
    routeState?.alert ?? null,
  )

  useEffect(() => {
    if (!routeState?.alert) {
      return
    }

    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, routeState?.alert, navigate])

  useEffect(() => {
    if (!alert) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setAlert(null)
    }, ALERT_AUTO_CLOSE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [alert])

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

  const handleOpenInquiryDialog = () => {
    if (!user) {
      navigate("/login")
      return
    }

    setIsInquiryDialogOpen(true)
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
    } catch (error) {
      setAlert({
        type: "error",
        title: "게시글을 삭제하지 못했습니다.",
        message:
          error instanceof Error
            ? error.message
            : "권한 또는 네트워크 상태를 확인한 뒤 다시 시도해주세요.",
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

    const message = inquiryMessage.trim()
    if (!message) {
      setAlert({
        type: "error",
        title: "문의 내용을 입력해주세요.",
        message: "입력한 내용이 댓글로 남고 판매자에게 Slack으로 전달됩니다.",
      })
      return
    }

    setIsSendingSlackAlert(true)
    setAlert(null)

    try {
      const result = await sendSlackTradeAlert(post.id, message)
      setAlert({
        type: result.status === "failed" ? "error" : "success",
        title:
          result.status === "sent"
            ? "판매자에게 Slack 문의를 보냈습니다."
            : result.status === "skipped"
              ? "Slack 문의 preview를 만들었습니다."
              : "Slack 문의를 보내지 못했습니다.",
        message: result.message,
      })
      if (result.status !== "failed") {
        setIsInquiryDialogOpen(false)
        setInquiryMessage(DEFAULT_INQUIRY_MESSAGE)
      }
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

      {isInquiryDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/45 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-dialog-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
            <h2
              id="inquiry-dialog-title"
              className="text-lg font-semibold text-gray-950"
            >
              판매자에게 문의하기
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              작성한 내용은 비밀댓글로 남고, 판매자에게 Slack 알림으로도
              전송됩니다.
            </p>

            <label className="mt-5 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                문의 내용
              </span>
              <textarea
                value={inquiryMessage}
                onChange={(event) => setInquiryMessage(event.target.value)}
                rows={5}
                maxLength={1000}
                className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm leading-6 text-gray-800 outline-none focus:border-[#00C471] focus:ring-2 focus:ring-[#D1FAE5]"
                placeholder="판매자에게 전달할 문의 내용을 입력하세요."
              />
            </label>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={isSendingSlackAlert}
                onClick={() => setIsInquiryDialogOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                disabled={isSendingSlackAlert}
                onClick={handleSendSlackAlert}
                className="rounded-lg bg-[#00C471] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00A862] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSendingSlackAlert ? "전송 중" : "비밀댓글 남기고 알림 보내기"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <Link
          to="/"
          className="text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>

      <div
        className={`grid gap-6 ${
          isOwner ? "" : "lg:grid-cols-[minmax(0,1fr)_320px]"
        }`}
      >
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

        {!isOwner && (
          <aside className="space-y-6">
          <section className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">판매자</h2>

            <div className="flex justify-center">
              <div
                aria-label="판매자 기본 프로필"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00C471] text-base font-semibold text-white shadow-sm"
              >
                {post.seller_initial}
              </div>
            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              프로필 보기
            </button>

            {!isOwner && post.seller_slack_enabled && (
              <button
                type="button"
                disabled={isSendingSlackAlert}
                onClick={handleOpenInquiryDialog}
                className="mt-2 w-full rounded-md bg-[#00C471] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00A862] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSendingSlackAlert
                  ? "문의 전송 중"
                  : "판매자에게 Slack 문의 보내기"}
              </button>
            )}

            {user && !isOwner && !post.seller_slack_enabled && (
              <p className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-500">
                이 판매자는 Slack 알림을 아직 연결하지 않았습니다. 댓글로
                문의해주세요.
              </p>
            )}
          </section>
          </aside>
        )}
      </div>
    </section>
  )
}

export default PostDetailPage
