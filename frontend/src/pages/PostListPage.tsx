import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { listPosts } from '../api/posts'
import type { Post } from '../types/post'
import { TagInput } from '../components/TagInput'

export function PostListPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [hasNext, setHasNext] = useState(false)
    const [hasPrev, setHasPrev] = useState(false)
    const pageSize = 10
    const [searchInput, setSearchInput] = useState('')
    const [q, setQ] = useState('')
    const [tagFilterInput, setTagFilterInput] = useState<string[]>([])
    const [tags, setTags] = useState<string[]>([])

    useEffect(() => {
        async function loadPosts() {
            setLoading(true)
            setError(null)

            try {
                const result = await listPosts({
                    q,
                    tags,
                    page: currentPage,
                    size: pageSize,
                })
                setPosts(result.items)
                setTotal(result.total)
                setHasNext(result.has_next)
                setHasPrev(result.has_prev)
            } catch {
                setError('failed to load posts')
            } finally {
                setLoading(false)
            }
        }

        loadPosts()
    }, [currentPage, q, tags])

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

                <Link to="/posts/new">Write post</Link>
                <form
                    className="search-form"
                    onSubmit={(event) => {
                        event.preventDefault()
                        setQ(searchInput)
                        setTags(tagFilterInput)
                        setCurrentPage(1)
                    }}
                >
                    <input
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search topics"
                    />
                    <TagInput
                        value={tagFilterInput}
                        onChange={setTagFilterInput}
                    />
                    <button type="submit">Search</button>
                </form>
            </section>

            {posts.length === 0 ? (
                <p>No posts yet.</p>
            ) : (
                <ul className="post-list">
                    {posts.map((post) => (
                        <li key={post.id} className="post-card">
                            <Link to={`/posts/${post.id}`}>
                                <h2>{post.title}</h2>
                            </Link>
                            <p>{post.body}</p>
                            <small>Author #{post.author_id}</small>
                            {post.tags.length > 0 && (
                                <div className="tag-list">
                                    {post.tags.map((tag) => (
                                        <span key={tag.id} className="tag-badge">
                                            {tag.display_name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <div className="pagination">
                <button
                    type="button"
                    onClick={() => setCurrentPage((page) => page - 1)}
                    disabled={!hasPrev}
                >
                    Previous
                </button>

                <span>
                    Page {currentPage} · {total} posts
                </span>

                <button
                    type="button"
                    onClick={() => setCurrentPage((page) => page + 1)}
                    disabled={!hasNext}
                >
                    Next
                </button>
            </div>

        </main>
    )
}
