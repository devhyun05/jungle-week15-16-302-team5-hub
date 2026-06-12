import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getPost, updatePost } from '../api/posts'
import { getCurrentUserIdFromToken } from '../utils/authToken'

export function PostEditPage() {
    const { postId } = useParams()
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [saveError, setSaveError] = useState<string | null>(null)

    useEffect(() => {
        async function loadPost() {
            if (!postId) {
                setLoadError('Post id is missing.')
                return
            }

            setLoading(true)
            setLoadError(null)
            setSaveError(null)

            try {
                const result = await getPost(Number(postId))
                const currentUserId = getCurrentUserIdFromToken()

                if (currentUserId !== result.author_id) {
                    setLoadError('You are not authorized to edit this post.')
                    return
                }

                setTitle(result.title)
                setBody(result.body)
            } catch {
                setLoadError('Failed to load post.')
            } finally {
                setLoading(false)
            }
        }
        
        loadPost()
    }, [postId])

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        if (!postId) {
            setLoadError('Post id is missing.')
            return
        }

        const token = localStorage.getItem('access_token')

        if (!token) {
            navigate('/login')
            return
        }

        setSaving(true)
        setSaveError(null)

        try {
            const updatedPost = await updatePost(
                Number(postId),
                {
                    title,
                    body,
                },
                token,
            )
            navigate(`/posts/${updatedPost.id}`)
        } catch {
            setSaveError('Failed to edit post.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <main className="page">
                <p>Loading post...</p>
            </main>
        )
    }

    if (loadError) {
        return (
            <main className="page">
                <p className="error-message">{loadError}</p>
                <Link to="/">Back to topics</Link>
            </main>
        )
    }
    
    return (
        <main className="page">
            <section className="post-form-panel">
                <Link to={`/posts/${postId}`}>Back to post</Link>

                <h1>Edit post</h1>

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

                    {saveError && <p className="error-message">{saveError}</p>}

                    <button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </form>
            </section>
        </main>
    )
}
