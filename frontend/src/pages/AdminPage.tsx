import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
    hideAdminComment,
    hideAdminPost,
    listAdminComments,
    listAdminPosts,
    restoreAdminComment,
    restoreAdminPost,
} from '../api/admin'
import { useAuthStore } from '../stores/authStore'
import type { AdminComment, AdminPost } from '../types/admin'


function formatDate(value: string) {
    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}


function statusLabel(hiddenAt: string | null) {
    return hiddenAt ? 'Hidden' : 'Visible'
}


export function AdminPage() {
    const navigate = useNavigate()
    const token = useAuthStore((state) => state.token)
    const currentUserRole = useAuthStore((state) => state.currentUserRole)
    const [posts, setPosts] = useState<AdminPost[]>([])
    const [comments, setComments] = useState<AdminComment[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)
    const [pendingAction, setPendingAction] = useState<string | null>(null)

    const loadAdminData = useCallback(async () => {
        if (!token) {
            navigate('/login')
            return
        }

        if (currentUserRole === null) {
            return
        }

        if (currentUserRole !== 'admin') {
            setError('Admin access required.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const [postResult, commentResult] = await Promise.all([
                listAdminPosts(token),
                listAdminComments(token),
            ])
            setPosts(postResult)
            setComments(commentResult)
        } catch {
            setError('Admin access required.')
        } finally {
            setLoading(false)
        }
    }, [currentUserRole, navigate, token])

    useEffect(() => {
        loadAdminData()
    }, [loadAdminData])

    async function runAction(actionKey: string, action: () => Promise<unknown>) {
        setPendingAction(actionKey)
        setActionError(null)

        try {
            await action()
            await loadAdminData()
        } catch {
            setActionError('Failed to update moderation status.')
        } finally {
            setPendingAction(null)
        }
    }

    function handleHidePost(post: AdminPost) {
        if (!token) {
            return
        }

        const reason = window.prompt('Hide reason', post.hidden_reason ?? '')

        if (reason === null) {
            return
        }

        runAction(
            `post:${post.id}:hide`,
            () => hideAdminPost(post.id, reason, token),
        )
    }

    function handleRestorePost(post: AdminPost) {
        if (!token) {
            return
        }

        runAction(
            `post:${post.id}:restore`,
            () => restoreAdminPost(post.id, token),
        )
    }

    function handleHideComment(comment: AdminComment) {
        if (!token) {
            return
        }

        const reason = window.prompt('Hide reason', comment.hidden_reason ?? '')

        if (reason === null) {
            return
        }

        runAction(
            `comment:${comment.id}:hide`,
            () => hideAdminComment(comment.id, reason, token),
        )
    }

    function handleRestoreComment(comment: AdminComment) {
        if (!token) {
            return
        }

        runAction(
            `comment:${comment.id}:restore`,
            () => restoreAdminComment(comment.id, token),
        )
    }

    if (loading) {
        return (
            <main className="page">
                <p>Loading moderation queue...</p>
            </main>
        )
    }

    if (token && currentUserRole === null) {
        return (
            <main className="page">
                <p>Checking admin access...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className="page">
                <p className="error-message">{error}</p>
            </main>
        )
    }

    return (
        <main className="page admin-page">
            <section className="admin-summary">
                <div>
                    <h1>Admin</h1>
                    <p>Moderation queue</p>
                </div>
                <dl>
                    <div>
                        <dt>Posts</dt>
                        <dd>{posts.length}</dd>
                    </div>
                    <div>
                        <dt>Comments</dt>
                        <dd>{comments.length}</dd>
                    </div>
                </dl>
            </section>

            {actionError && <p className="error-message">{actionError}</p>}

            <section className="admin-section">
                <div className="section-heading">
                    <h2>Posts</h2>
                    <span>{posts.length} items</span>
                </div>

                {posts.length === 0 ? (
                    <p className="empty-message">No posts to moderate.</p>
                ) : (
                    <ul className="admin-list">
                        {posts.map((post) => {
                            const actionKey = post.hidden_at
                                ? `post:${post.id}:restore`
                                : `post:${post.id}:hide`

                            return (
                                <li key={post.id} className="admin-item">
                                    <div className="admin-item-header">
                                        <div>
                                            <Link to={`/posts/${post.id}`}>{post.title}</Link>
                                            <small>
                                                Post #{post.id} by user #{post.author_id}
                                                {' · '}
                                                {formatDate(post.created_at)}
                                            </small>
                                        </div>
                                        <span
                                            className={
                                                post.hidden_at
                                                    ? 'status-pill status-hidden'
                                                    : 'status-pill status-visible'
                                            }
                                        >
                                            {statusLabel(post.hidden_at)}
                                        </span>
                                    </div>

                                    <p>{post.body}</p>

                                    {post.hidden_reason && (
                                        <p className="moderation-reason">
                                            Reason: {post.hidden_reason}
                                        </p>
                                    )}

                                    <div className="admin-actions">
                                        {post.hidden_at ? (
                                            <button
                                                type="button"
                                                disabled={pendingAction === actionKey}
                                                onClick={() => handleRestorePost(post)}
                                            >
                                                Restore
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={pendingAction === actionKey}
                                                onClick={() => handleHidePost(post)}
                                            >
                                                Hide
                                            </button>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>

            <section className="admin-section">
                <div className="section-heading">
                    <h2>Comments</h2>
                    <span>{comments.length} items</span>
                </div>

                {comments.length === 0 ? (
                    <p className="empty-message">No comments to moderate.</p>
                ) : (
                    <ul className="admin-list">
                        {comments.map((comment) => {
                            const actionKey = comment.hidden_at
                                ? `comment:${comment.id}:restore`
                                : `comment:${comment.id}:hide`

                            return (
                                <li key={comment.id} className="admin-item">
                                    <div className="admin-item-header">
                                        <div>
                                            <Link to={`/posts/${comment.post_id}`}>
                                                Comment #{comment.id} on post #{comment.post_id}
                                            </Link>
                                            <small>
                                                By user #{comment.author_id}
                                                {' · '}
                                                {formatDate(comment.created_at)}
                                            </small>
                                        </div>
                                        <span
                                            className={
                                                comment.hidden_at
                                                    ? 'status-pill status-hidden'
                                                    : 'status-pill status-visible'
                                            }
                                        >
                                            {statusLabel(comment.hidden_at)}
                                        </span>
                                    </div>

                                    <p>{comment.body}</p>

                                    {comment.hidden_reason && (
                                        <p className="moderation-reason">
                                            Reason: {comment.hidden_reason}
                                        </p>
                                    )}

                                    <div className="admin-actions">
                                        {comment.hidden_at ? (
                                            <button
                                                type="button"
                                                disabled={pendingAction === actionKey}
                                                onClick={() => handleRestoreComment(comment)}
                                            >
                                                Restore
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={pendingAction === actionKey}
                                                onClick={() => handleHideComment(comment)}
                                            >
                                                Hide
                                            </button>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>
        </main>
    )
}
