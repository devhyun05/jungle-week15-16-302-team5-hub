import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

import {
    createComment,
    deleteComment,
    listComments,
    updateComment,
} from '../api/comments'
import { deletePost, getPost } from '../api/posts'
import type { Comment as BoardComment } from '../types/comment'
import type { Post } from '../types/post'

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

const COMMENTS_PAGE_SIZE = 20

export function PostDetailPage() {
    const navigate = useNavigate()
    const { postId } = useParams()
    const token = useAuthStore((state) => state.token)
    const currentUserId = useAuthStore((state) => state.currentUserId)
    const isLoggedIn = Boolean(token)

    const [post, setPost] = useState<Post | null>(null)
    const [comments, setComments] = useState<BoardComment[]>([])
    const [commentsPage, setCommentsPage] = useState(1)
    const [commentsTotal, setCommentsTotal] = useState(0)
    const [commentsHasNext, setCommentsHasNext] = useState(false)
    const [commentsHasPrev, setCommentsHasPrev] = useState(false)
    const [loading, setLoading] = useState(false)
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [commentsError, setCommentsError] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [newCommentBody, setNewCommentBody] = useState('')
    const [creatingComment, setCreatingComment] = useState(false)
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
    const [editingCommentBody, setEditingCommentBody] = useState('')
    const [updatingCommentId, setUpdatingCommentId] = useState<number | null>(null)
    const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null)
    const [commentActionError, setCommentActionError] = useState<string | null>(null)

    async function loadCommentsPage(nextPage: number) {
        const postIdAsNumber = Number(postId)

        if (Number.isNaN(postIdAsNumber)) {
            return
        }

        setCommentsLoading(true)
        setCommentsError(null)

        try {
            const result = await listComments(postIdAsNumber, {
                page: nextPage,
                size: COMMENTS_PAGE_SIZE,
            })
            setComments(result.items)
            setCommentsPage(result.page)
            setCommentsTotal(result.total)
            setCommentsHasNext(result.has_next)
            setCommentsHasPrev(result.has_prev)
        } catch {
            setCommentsError('Failed to load comments.')
        } finally {
            setCommentsLoading(false)
        }
    }

    useEffect(() => {
        async function loadPost() {
            const postIdAsNumber = Number(postId)

            if (Number.isNaN(postIdAsNumber)) {
                setError('Post id is invalid.')
                return
            }

            setLoading(true)
            setError(null)
            setComments([])
            setCommentsPage(1)
            setCommentsTotal(0)
            setCommentsHasNext(false)
            setCommentsHasPrev(false)
            setCommentsError(null)
            setCommentActionError(null)

            try {
                const result = await getPost(postIdAsNumber)
                setPost(result)
            } catch {
                setError('Failed to load post.')
                return
            } finally {
                setLoading(false)
            }

            await loadCommentsPage(1)
        }

        loadPost()
    }, [postId])

    async function handleDelete() {
        if (!post) {
            return
        }

        if (!token) {
            navigate('/login')
            return
        }

        const confirmed = window.confirm('Delete this post?')

        if (!confirmed) {
            return
        }

        setDeleting(true)
        setError(null)

        try {
            await deletePost(post.id, token)
            navigate('/')
        } catch {
            setError('Failed to delete post.')
        } finally {
            setDeleting(false)
        }
    }

    async function handleCreateComment(event: React.FormEvent) {
        event.preventDefault()

        if (!post) {
            return
        }

        if (!token) {
            navigate('/login')
            return
        }

        const body = newCommentBody.trim()

        if (!body) {
            return
        }

        setCreatingComment(true)
        setCommentActionError(null)

        try {
            await createComment(post.id, { body }, token)
            setNewCommentBody('')
            const lastPage = Math.max(
                1,
                Math.ceil((commentsTotal + 1) / COMMENTS_PAGE_SIZE),
            )
            await loadCommentsPage(lastPage)
        } catch {
            setCommentActionError('Failed to create comment.')
        } finally {
            setCreatingComment(false)
        }
    }

    function startEditComment(comment: BoardComment) {
        setEditingCommentId(comment.id)
        setEditingCommentBody(comment.body)
        setCommentActionError(null)
    }

    function cancelEditComment() {
        setEditingCommentId(null)
        setEditingCommentBody('')
        setCommentActionError(null)
    }

    async function handleUpdateComment(event: React.FormEvent, commentId: number) {
        event.preventDefault()

        if (!token) {
            navigate('/login')
            return
        }

        const body = editingCommentBody.trim()

        if (!body) {
            return
        }

        setUpdatingCommentId(commentId)
        setCommentActionError(null)

        try {
            const updatedComment = await updateComment(commentId, { body }, token)
            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment.id === commentId ? updatedComment : comment,
                ),
            )
            cancelEditComment()
        } catch {
            setCommentActionError('Failed to edit comment.')
        } finally {
            setUpdatingCommentId(null)
        }
    }

    async function handleDeleteComment(commentId: number) {
        if (!token) {
            navigate('/login')
            return
        }

        const confirmed = window.confirm('Delete this comment?')

        if (!confirmed) {
            return
        }

        setDeletingCommentId(commentId)
        setCommentActionError(null)

        try {
            await deleteComment(commentId, token)
            const nextTotal = Math.max(0, commentsTotal - 1)
            const lastPage = Math.max(
                1,
                Math.ceil(nextTotal / COMMENTS_PAGE_SIZE),
            )
            await loadCommentsPage(Math.min(commentsPage, lastPage))
        } catch {
            setCommentActionError('Failed to delete comment.')
        } finally {
            setDeletingCommentId(null)
        }
    }

    if (loading) {
        return (
            <main className="page">
                <p>Loading post...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className="page">
                <p className="error-message">{error}</p>
                <Link to="/">Back to topics</Link>
            </main>
        )
    }

    if (!post) {
        return (
            <main className="page">
                <p>Post not found.</p>
                <Link to="/">Back to topics</Link>
            </main>
        )
    }

    const isAuthor = currentUserId === post.author_id

    return (
        <main className="page">
            <article className="post-detail">
                <Link to="/">Back to topics</Link>

                <h1>{post.title}</h1>
                <p>{post.body}</p>
                <small>Author #{post.author_id}</small>
                {isAuthor && (
                    <div className="post-actions">
                        <button type="button" onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                        <Link to={`/posts/${post.id}/edit`}>Edit</Link>
                    </div>
                )}
                {post.tags.length > 0 && (
                    <div className="tag-list">
                        {post.tags.map((tag) => (
                            <span key={tag.id} className="tag-badge">
                                {tag.display_name}
                            </span>
                        ))}
                    </div>
                )}
            </article>

            <section className="comments-section" aria-labelledby="comments-title">
                <div className="section-heading">
                    <h2 id="comments-title">Comments</h2>
                    <span>{commentsTotal}</span>
                </div>

                {isLoggedIn ? (
                    <form className="comment-form" onSubmit={handleCreateComment}>
                        <label>
                            Add a comment
                            <textarea
                                value={newCommentBody}
                                onChange={(event) => setNewCommentBody(event.target.value)}
                                placeholder="Share a helpful thought..."
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={creatingComment || !newCommentBody.trim()}
                        >
                            {creatingComment ? 'Posting...' : 'Post comment'}
                        </button>
                    </form>
                ) : (
                    <p className="comment-login-note">
                        <Link to="/login">Log in</Link> to join the conversation.
                    </p>
                )}

                {commentActionError && (
                    <p className="error-message">{commentActionError}</p>
                )}

                {commentsLoading && <p>Loading comments...</p>}

                {!commentsLoading && commentsError && (
                    <p className="error-message">{commentsError}</p>
                )}

                {!commentsLoading && !commentsError && commentsTotal === 0 && (
                    <p className="empty-message">No comments yet.</p>
                )}

                {!commentsLoading && !commentsError && comments.length > 0 && (
                    <ul className="comment-list">
                        {comments.map((comment) => {
                            const isOwner = currentUserId === comment.author_id
                            const isEditing = editingCommentId === comment.id
                            const isUpdating = updatingCommentId === comment.id
                            const isDeleting = deletingCommentId === comment.id

                            return (
                                <li className="comment-item" key={comment.id}>
                                    <div className="comment-meta">
                                        <span>Author #{comment.author_id}</span>
                                        <time dateTime={comment.created_at}>
                                            {formatDate(comment.created_at)}
                                        </time>
                                    </div>

                                    {isEditing ? (
                                        <form
                                            className="comment-edit-form"
                                            onSubmit={(event) =>
                                                handleUpdateComment(event, comment.id)
                                            }
                                        >
                                            <textarea
                                                value={editingCommentBody}
                                                onChange={(event) =>
                                                    setEditingCommentBody(event.target.value)
                                                }
                                            />

                                            <div className="comment-actions">
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        isUpdating ||
                                                        !editingCommentBody.trim()
                                                    }
                                                >
                                                    {isUpdating ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEditComment}
                                                    disabled={isUpdating}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <p>{comment.body}</p>

                                            {isOwner && (
                                                <div className="comment-actions">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            startEditComment(comment)
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteComment(comment.id)
                                                        }
                                                        disabled={isDeleting}
                                                    >
                                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                )}

                {!commentsLoading &&
                    !commentsError &&
                    commentsTotal > COMMENTS_PAGE_SIZE && (
                        <div className="pagination">
                            <button
                                type="button"
                                onClick={() => loadCommentsPage(commentsPage - 1)}
                                disabled={!commentsHasPrev}
                            >
                                Previous
                            </button>

                            <span>
                                Page {commentsPage} · {commentsTotal} comments
                            </span>

                            <button
                                type="button"
                                onClick={() => loadCommentsPage(commentsPage + 1)}
                                disabled={!commentsHasNext}
                            >
                                Next
                            </button>
                        </div>
                    )}
            </section>
        </main>
    )
}
