import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

import { LoginPage } from './pages/LoginPage'
import { PostDetailPage } from './pages/PostDetailPage'
import { PostListPage } from './pages/PostListPage'
import { PostCreatePage } from './pages/PostCreatePage'
import { PostEditPage } from './pages/PostEditPage'
import { SignupPage } from './pages/SignupPage'
import './index.css'

function App() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)

  function handleLogout() {
    logout()
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/posts/:postId" element={<PostDetailPage />} />
        <Route path="/posts/new" element={<PostCreatePage />} />
        <Route path="/posts/:postId/edit" element={<PostEditPage />} />
      </Routes>
    </div>
  )
}

export default App
