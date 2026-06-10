import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { createPost } from '../api/posts'

export function PostCreatePage() {
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        const token = localStorage.getItem('access_token')

        if (!token) {
            navigate('/login')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const createdPost = await createPost(
                {
                    title,
                    body,
                },
                token,
            )

            navigate(`/posts/${createdPost.id}`)
        } catch (caughtError) {
            console.error(caughtError)
            setError('Failed to create post.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="page">
            <section className="post-form-panel">
                <Link to="/">Back to topics</Link>

                <h1>Write post</h1>
                <p>Start one focused beauty or fashion topic</p>

                <form onSubmit={handleSubmit}>
                    <label>
                        Title
                        <input
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                    </label>

                    <label>
                        Body
                        <textarea
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                        />
                    </label>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Publishing...' : 'Publish'}
                    </button>
                </form>
            </section>
        </main>
    )
}