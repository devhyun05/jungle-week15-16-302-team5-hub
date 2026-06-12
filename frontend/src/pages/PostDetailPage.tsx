import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getMe } from '../api/auth'
import {
    createComment,
    deleteComment,
    listComments,
    updateComment,
} from '../api/comments'
import { deletePost, getPost } from '../api/posts'
import type { Comment as BoardComment } from '../types/comment'
import type { Post } from '../types/post'
import { getCurrentUserIdFromToken } from '../utils/authToken'

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

export function PostDetailPage() {
    const navigate = useNavigate()
    const { postId } = useParams()

    const [post, setPost] = useState<Post | null>(null)
    const [comments, setComments] = useState<BoardComment[]>([])
    const [loading, setLoading] = useState(false)
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [commentsError, setCommentsError] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)
    const [newCommentBody, setNewCommentBody] = useState('')
    const [creatingComment, setCreatingComment] = useState(false)
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
    const [editingCommentBody, setEditingCommentBody] = useState('')
    const [updatingCommentId, setUpdatingCommentId] = useState<number | null>(null)
    const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null)
    const [commentActionError, setCommentActionError] = useState<string | null>(null)

    const isLoggedIn = Boolean(localStorage.getItem('access_token'))

    useEffect(() => {
        async function loadCurrentUser() {
            const token = localStorage.getItem('access_token')
            const storedUserId = localStorage.getItem('current_user_id')

            if (!token) {
                setCurrentUserId(null)
                return
            }

            if (storedUserId) {
                setCurrentUserId(Number(storedUserId))
                return
            }

            try {
                const user = await getMe(token)
                localStorage.setItem('current_user_id', String(user.id))
                setCurrentUserId(user.id)
            } catch {
                localStorage.removeItem('access_token')
                localStorage.removeItem('current_user_id')
                setCurrentUserId(null)
            }
        }

        loadCurrentUser()
    }, [])

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

            setCommentsLoading(true)

            try {
                const result = await listComments(postIdAsNumber)
                setComments(result)
            } catch {
                setCommentsError('Failed to load comments.')
            } finally {
                setCommentsLoading(false)
            }
        }

        loadPost()
    }, [postId])

    async function handleDelete() {
        if (!post) {
            return
        }

        const token = localStorage.getItem('access_token')

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

        const token = localStorage.getItem('access_token')

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
            const createdComment = await createComment(post.id, { body }, token)
            setComments((prevComments) => [...prevComments, createdComment])
            setNewCommentBody('')
            setCurrentUserId(createdComment.author_id)
            localStorage.setItem('current_user_id', String(createdComment.author_id))
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

        const token = localStorage.getItem('access_token')

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
        const token = localStorage.getItem('access_token')

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
            setComments((prevComments) =>
                prevComments.filter((comment) => comment.id !== commentId),
            )
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

    const isAuthor = getCurrentUserIdFromToken() === post.author_id

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
            </article>

            <section className="comments-section" aria-labelledby="comments-title">
                <div className="section-heading">
                    <h2 id="comments-title">Comments</h2>
                    <span>{comments.length}</span>
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

                {!commentsLoading && !commentsError && comments.length === 0 && (
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
            </section>
        </main>
    )
}
