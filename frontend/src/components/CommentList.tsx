import { useEffect, useState } from "react"
import { createComment, deleteComment, listComments } from "../api/comments"
import type { FormEvent } from "react"
import type { Comment } from "../types/comment"

type CommentListProps = {
  postId: number
}

const formatTime = (createdAt: string) => {
  const createdTime = new Date(createdAt).getTime()
  const diffMinutes = Math.floor((Date.now() - createdTime) / 1000 / 60)

  if (diffMinutes < 1) return "방금 전"
  if (diffMinutes < 60) return `${diffMinutes}분 전`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}시간 전`

  return `${Math.floor(diffHours / 24)}일 전`
}

const getCommentInitial = (comment: Comment) => {
  return comment.writer_name.trim().slice(0, 1).toUpperCase()
}

const CommentList = ({ postId }: CommentListProps) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState("")
  const [isSecret, setIsSecret] = useState(false)
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const fetchComments = async () => {
    setIsLoading(true)
    setErrorMessage("")

    try {
      const comments = await listComments(postId)
      setComments(comments)
    } catch {
      setErrorMessage("댓글을 불러오지 못했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const syncComments = async () => {
      setIsLoading(true)
      setErrorMessage("")

      try {
        const comments = await listComments(postId)
        if (isMounted) {
          setComments(comments)
        }
      } catch {
        if (isMounted) {
          setErrorMessage("댓글을 불러오지 못했습니다.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    syncComments()

    return () => {
      isMounted = false
    }
  }, [postId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedContent = content.trim()
    if (!trimmedContent) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const comment = await createComment(postId, {
        content: trimmedContent,
        parent_comment_id: replyTarget?.id ?? null,
        is_secret: isSecret,
      })
      setComments((currentComments) => [...currentComments, comment])
      setContent("")
      setIsSecret(false)
      setReplyTarget(null)
    } catch {
      setErrorMessage("댓글을 등록하지 못했습니다. 로그인 상태를 확인해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: number) => {
    if (!window.confirm("댓글을 삭제할까요?")) {
      return
    }

    setErrorMessage("")

    try {
      await deleteComment(postId, commentId)
      await fetchComments()
    } catch {
      setErrorMessage("댓글을 삭제하지 못했습니다.")
    }
  }

  return (
    <section className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-gray-800">댓글 문의</h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        {replyTarget && (
          <div className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-2 text-xs text-gray-500">
            <span>{replyTarget.writer_name}님에게 답글 작성 중</span>
            <button
              type="button"
              className="font-semibold text-gray-700 hover:text-gray-950"
              onClick={() => setReplyTarget(null)}
            >
              취소
            </button>
          </div>
        )}

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <input
            type="text"
            className="rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400"
            placeholder="문의 내용을 입력하세요"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[#00C471] px-5 py-3 text-sm font-semibold text-white hover:bg-[#00A862] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? "등록 중" : replyTarget ? "답글 등록" : "등록"}
          </button>
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-500">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            checked={isSecret}
            onChange={(event) => setIsSecret(event.target.checked)}
          />
          비밀댓글
        </label>
      </form>

      {errorMessage && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-500">
          {errorMessage}
        </p>
      )}

      {isLoading && (
        <p className="rounded-md bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
          댓글을 불러오고 있습니다.
        </p>
      )}

      {!isLoading && comments.length === 0 && (
        <p className="rounded-md bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
          아직 댓글이 없습니다.
        </p>
      )}

      {!isLoading && comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment) => (
            <article
              key={comment.id}
              className={
                comment.parent_comment_id
                  ? "ml-8 border-t border-dashed border-gray-300 pt-4"
                  : "border-t border-dashed border-gray-300 pt-4"
              }
            >
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                  {comment.is_hidden ? "🔒" : getCommentInitial(comment)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-gray-800">
                      {comment.is_hidden ? "비밀 댓글" : comment.writer_name}
                    </strong>
                    {comment.is_secret && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                        비밀댓글
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                    {comment.content}
                  </p>

                  <div className="mt-2 flex gap-3 text-xs font-medium text-gray-400">
                    {!comment.parent_comment_id && !comment.is_hidden && (
                      <button
                        type="button"
                        className="hover:text-gray-700"
                        onClick={() => setReplyTarget(comment)}
                      >
                        답글
                      </button>
                    )}
                    {comment.can_delete && (
                      <button
                        type="button"
                        className="hover:text-red-500"
                        onClick={() => handleDelete(comment.id)}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default CommentList
