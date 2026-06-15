import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { signup } from '../api/auth'

export function SignupPage() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        const trimmedEmail = email.trim()
        const trimmedDisplayName = displayName.trim()

        if (!trimmedEmail || !trimmedDisplayName || !password) {
            setError('Please fill in email, display name, and password.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            await signup({
                email: trimmedEmail,
                display_name: trimmedDisplayName,
                password,
            })

            navigate('/login')
        } catch {
            setError('Failed to sign up.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="page">
            <section className="auth-panel">
                <h1>Sign up</h1>
                <p>Create a GlowBoard account to write and manage topics.</p>

                <form onSubmit={handleSubmit}>
                    <label>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </label>

                    <label>
                        Display name
                        <input
                            type="text"
                            value={displayName}
                            onChange={(event) => setDisplayName(event.target.value)}
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </label>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign up'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </section>
        </main>
    )
}
