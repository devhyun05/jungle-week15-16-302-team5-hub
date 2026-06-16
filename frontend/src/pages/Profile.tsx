import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { deletePost } from "../api/posts"
import { getMyComments, getMyPosts, getMyProfile } from "../api/users"
import AlertBanner from "../components/AlertBanner"
import ConfirmDialog from "../components/ConfirmDialog"
import type { MyComment, MyPostSummary, UserMe } from "../api/users"
import type { AlertType } from "../components/AlertBanner"

type ProfileTab = "posts" | "comments"
type AlertState = {
  type: AlertType
  title: string
  message?: string
}

const statusLabel = {
  selling: "판매중",
  reserved: "예약중",
  sold: "거래완료",
} as const

const formatPrice = (price: number) => `${price.toLocaleString("ko-KR")}원`

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))

const Profile = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts")
  const [profile, setProfile] = useState<UserMe | null>(null)
  const [postSummary, setPostSummary] = useState<MyPostSummary | null>(null)
  const [comments, setComments] = useState<MyComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
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

    const fetchProfileData = async () => {
      setIsLoading(true)
      setErrorMessage("")

      try {
        const [profile, postSummary, comments] = await Promise.all([
          getMyProfile(),
          getMyPosts(),
          getMyComments(),
        ])

        if (isMounted) {
          setProfile(profile)
          setPostSummary(postSummary)
          setComments(comments)
        }
      } catch {
        if (isMounted) {
          setErrorMessage("마이페이지 정보를 불러오지 못했습니다.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProfileData()

    return () => {
      isMounted = false
    }
  }, [])

  const handleDeletePost = (postId: number) => {
    setDeleteTargetId(postId)
  }

  const handleConfirmDeletePost = async () => {
    if (!deleteTargetId) {
      return
    }

    setDeletingPostId(deleteTargetId)
    setAlert(null)

    try {
      await deletePost(deleteTargetId)
      setPostSummary((prevSummary) => {
        if (!prevSummary) {
          return prevSummary
        }

        const deletedPost = prevSummary.posts.find(
          (post) => post.id === deleteTargetId,
        )
        const posts = prevSummary.posts.filter(
          (post) => post.id !== deleteTargetId,
        )

        return {
          ...prevSummary,
          posts,
          total_count: Math.max(prevSummary.total_count - 1, 0),
          selling_count:
            deletedPost?.status === "selling"
              ? Math.max(prevSummary.selling_count - 1, 0)
              : prevSummary.selling_count,
          reserved_count:
            deletedPost?.status === "reserved"
              ? Math.max(prevSummary.reserved_count - 1, 0)
              : prevSummary.reserved_count,
          sold_count:
            deletedPost?.status === "sold"
              ? Math.max(prevSummary.sold_count - 1, 0)
              : prevSummary.sold_count,
        }
      })
      setAlert({
        type: "success",
        title: "게시글이 삭제되었습니다.",
        message: "내가 쓴 글 목록에서 해당 게시글을 제거했습니다.",
      })
    } catch {
      setAlert({
        type: "error",
        title: "게시글을 삭제하지 못했습니다.",
        message: "네트워크 상태를 확인한 뒤 다시 시도해주세요.",
      })
    } finally {
      setDeletingPostId(null)
      setDeleteTargetId(null)
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4">
        <div className="rounded-lg border border-gray-300 bg-white py-20 text-center text-sm font-medium text-gray-400">
          마이페이지 정보를 불러오고 있습니다.
        </div>
      </section>
    )
  }

  if (errorMessage || !profile || !postSummary) {
    return (
      <section className="mx-auto max-w-7xl px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 py-20 text-center text-sm font-medium text-red-500">
          {errorMessage || "마이페이지 정보를 찾을 수 없습니다."}
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
        isOpen={deleteTargetId !== null}
        title="게시글을 삭제할까요?"
        description="삭제한 게시글은 목록에서 사라지며, 현재 화면에서는 바로 되돌릴 수 없습니다."
        confirmLabel="삭제하기"
        isLoading={deletingPostId !== null}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDeletePost}
      />

      <div className="rounded-lg border border-gray-300 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="flex gap-6">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt=""
                className="h-24 w-24 rounded-full border-2 border-gray-300 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-200 text-3xl font-semibold text-gray-600">
                {profile.username.slice(0, 1).toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {profile.username}
              </h1>
              <p className="mt-2 text-sm text-gray-500">{profile.email}</p>
              <p className="mt-2 text-sm text-gray-500">
                {formatDate(profile.created_at)} 가입
              </p>
            </div>
          </div>

          <Link
            to="/profile-edit"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            프로필 수정
          </Link>
        </div>

        <div className="mt-8 border-t border-dashed border-gray-300 pt-6">
          <div className="grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <p className="text-lg font-semibold text-gray-950">
                {postSummary.total_count}
              </p>
              <p className="mt-1 text-xs text-gray-500">작성글</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-950">
                {postSummary.selling_count}
              </p>
              <p className="mt-1 text-xs text-gray-500">판매중</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-950">
                {postSummary.reserved_count}
              </p>
              <p className="mt-1 text-xs text-gray-500">예약중</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-950">
                {postSummary.sold_count}
              </p>
              <p className="mt-1 text-xs text-gray-500">거래완료</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 border-b border-gray-300">
        <div className="flex gap-8">
          <button
            className={`border-b-2 px-2 pb-4 text-sm font-semibold transition ${
              activeTab === "posts"
                ? "border-gray-800 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            📄 내가 쓴 글
          </button>
          <button
            className={`border-b-2 px-2 pb-4 text-sm font-semibold transition ${
              activeTab === "comments"
                ? "border-gray-800 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("comments")}
          >
            💬 댓글 내역
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {activeTab === "posts" ? (
          <>
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-400">
                작성글 {postSummary.total_count}개
              </p>

              <Link
                to="/post-create"
                className="rounded-md bg-[#00C471] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00A862]"
              >
                새 글 작성
              </Link>
            </div>

            <div className="mt-4 space-y-4">
              {postSummary.posts.length === 0 ? (
                <div className="rounded-lg border border-gray-300 bg-white py-16 text-center text-sm font-medium text-gray-400">
                  아직 작성한 글이 없습니다.
                </div>
              ) : (
                postSummary.posts.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        to={`/post-details/${post.id}`}
                        className="block flex-1"
                      >
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-500">
                            중고거래
                          </span>
                          <span className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-500">
                            {statusLabel[post.status]}
                          </span>
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900">
                          {post.title}
                        </h2>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <span>{formatPrice(post.price)}</span>
                          <span>·</span>
                          <span>{post.trade_location}</span>
                          <span>·</span>
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                      </Link>

                      <div className="flex shrink-0 gap-2">
                        <Link
                          to={`/post-edit/${post.id}`}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
                        >
                          수정
                        </Link>

                        <button
                          type="button"
                          disabled={deletingPostId === post.id}
                          onClick={() => handleDeletePost(post.id)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingPostId === post.id ? "삭제 중" : "삭제"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-400">
                댓글 내역 {comments.length}개
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {comments.length === 0 ? (
                <div className="rounded-lg border border-gray-300 bg-white py-16 text-center text-sm font-medium text-gray-400">
                  아직 작성한 댓글이 없습니다.
                </div>
              ) : (
                comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm"
                  >
                    <Link to={`/post-details/${comment.post_id}`}>
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          {comment.is_secret ? "비밀댓글" : "댓글"}
                        </span>
                        {comment.parent_comment_id && (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                            답글
                          </span>
                        )}
                        <span className="text-sm text-gray-400">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>

                      <h2 className="text-lg font-semibold text-gray-900">
                        {comment.post_title}
                      </h2>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                        {comment.content}
                      </p>
                    </Link>
                  </article>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Profile
