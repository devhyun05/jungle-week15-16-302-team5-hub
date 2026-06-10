import { useEffect, useState } from 'react'

import { listPosts } from '../api/posts'
import type { Post } from '../types/post'

export function PostListPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadPosts() {
            setLoading(true)
            setError(null)

            try {
                const result = await listPosts()
                setPosts(result)
            } catch {
                setError('failed to load posts')
            } finally {
                setLoading(false)
            }
        }

        loadPosts()
    }, [])

    if (loading) {
        return (
            <main className="page">
                <p>Loading posts...</p>
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
        <main className="page">
            <section className="post-list-header">
                <div>
                    <h1>GlowBoard Topics</h1>
                    <p>Browse beauty and fashion discussions from the community.</p>
                </div>

                <button type="button">Write post</button>
            </section>

            {posts.length === 0 ? (
                <p>No posts yet.</p>
            ) : (
                <ul className="post-list">
                    {posts.map((post) => (
                        <li key={post.id} className="post-card">
                            <h2>{post.title}</h2>
                            <p>{post.body}</p>
                            <small>Author #{post.author_id}</small>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    )
}