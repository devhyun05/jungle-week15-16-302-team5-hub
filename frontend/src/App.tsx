import { useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'

import { LoginPage } from './pages/LoginPage'
import { PostDetailPage } from './pages/PostDetailPage'
import { PostListPage } from './pages/PostListPage'
import { PostCreatePage } from './pages/PostCreatePage'
import { PostEditPage } from './pages/PostEditPage'
import { SignupPage } from './pages/SignupPage'
import './index.css'

function App() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem('access_token'),
  )

  function handleLogout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('current_user_id')
    setToken(null)
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <strong>GlowBoard</strong>
          <span>Global beauty and fashion topics</span>
        </div>

        <nav>
          {token ? (
            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <>
              <Link to="/signup">Sign up</Link>
              <Link to="/login">Log in</Link>
            </>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<PostListPage />} />
        <Route
          path="/login"
          element={<LoginPage onLogin={(nextToken) => setToken(nextToken)} />}
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/posts/:postId" element={<PostDetailPage />} />
        <Route path="/posts/new" element={<PostCreatePage />} />
        <Route path="/posts/:postId/edit" element={<PostEditPage />} />
      </Routes>
    </div>
  )
}

export default App
