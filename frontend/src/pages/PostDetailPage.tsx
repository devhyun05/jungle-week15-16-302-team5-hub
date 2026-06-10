import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getPost } from '../api/posts'
import type { Post } from '../types/post'

export function PostDetailPage() {
    const { postId } = useParams()

    const [post, setPost] = useState<Post | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadPost() {
            if (!postId) {
                setError('Post id is missing.')
                return
            }

            setLoading(true)
            setError(null)

            try {
                const result = await getPost(Number(postId))
                setPost(result)
            } catch {
                setError('Failed to load post.')
            } finally {
                setLoading(false)
            }
        }

        loadPost()
    }, [postId])

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

    return (
        <main className="page">
            <article className="post-detail">
                <Link to="/">Back to topics</Link>

                <h1>{post.title}</h1>
                <p>{post.body}</p>
                <small>Author #{post.author_id}</small>
            </article>
        </main>
    )
}
