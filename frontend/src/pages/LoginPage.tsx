import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { login } from '../api/auth'

type LoginPageProps = {
  onLogin: (token: string) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        setLoading(true)
        setError(null)

        try {
            const result = await login({
                email,
                password,
            })

            localStorage.setItem('access_token', result.access_token)
            onLogin(result.access_token)

            navigate('/')
        } catch {
            setError('failed to log in.')
        } finally {
            setLoading(false)
        }
    }
    return (
        <main className="page">
            <section className="auth-panel">
                <h1>Log in</h1>
                <p>Sign in to write and manage GlowBoard topics.</p>

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
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </label>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>
            </section>
        </main>
    )
}