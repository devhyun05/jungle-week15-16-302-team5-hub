import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { getMyActivity } from '../api/users'
import { useAuthStore } from '../stores/authStore'
import type { MyActivity } from '../types/user'


function formatDate(value: string) {
    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}


export function MyPage() {
    const navigate = useNavigate()
    const token = useAuthStore((state) => state.token)
    const [activity, setActivity] = useState<MyActivity | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadActivity() {
            if (!token) {
                navigate('/login')
                return
            }

            setLoading(true)
            setError(null)

            try {
                const result = await getMyActivity(token)
                setActivity(result)
            } catch {
                setError('Failed to load your activity.')
            } finally {
                setLoading(false)
            }
        }

        loadActivity()
    }, [navigate, token])

    if (loading) {
        return (
            <main className="page">
                <p>Loading your activity...</p>
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

    if (!activity) {
        return (
            <main className="page">
                <p>No profile loaded.</p>
            </main>
        )
    }

    return (
        <main className="page">
            <section className="profile-summary">
                <div>
                    <h1>My Page</h1>
                    <p>{activity.user.display_name}</p>
                </div>
                <dl>
                    <div>
                        <dt>Email</dt>
                        <dd>{activity.user.email}</dd>
                    </div>
                    <div>
                        <dt>Role</dt>
                        <dd>{activity.user.role}</dd>
                    </div>
                    <div>
                        <dt>Joined</dt>
                        <dd>{formatDate(activity.user.created_at)}</dd>
                    </div>
                </dl>
            </section>

            <section className="activity-section">
                <div className="section-heading">
                    <h2>My posts</h2>
                    <span>{activity.posts.length} posts</span>
                </div>

                {activity.posts.length === 0 ? (
                    <p className="empty-message">You have not written any visible posts yet.</p>
                ) : (
                    <ul className="activity-list">
                        {activity.posts.map((post) => (
                            <li key={post.id}>
                                <Link to={`/posts/${post.id}`}>{post.title}</Link>
                                <p>{post.body}</p>
                                <small>{formatDate(post.created_at)}</small>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="activity-section">
                <div className="section-heading">
                    <h2>My comments</h2>
                    <span>{activity.comments.length} comments</span>
                </div>

                {activity.comments.length === 0 ? (
                    <p className="empty-message">You have not written any visible comments yet.</p>
                ) : (
                    <ul className="activity-list">
                        {activity.comments.map((comment) => (
                            <li key={comment.id}>
                                <Link to={`/posts/${comment.post_id}`}>
                                    Comment on post #{comment.post_id}
                                </Link>
                                <p>{comment.body}</p>
                                <small>{formatDate(comment.created_at)}</small>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    )
}
