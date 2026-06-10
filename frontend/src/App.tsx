import { Link, Route, Routes } from 'react-router-dom'

import { LoginPage } from './pages/LoginPage'
import { PostDetailPage } from './pages/PostDetailPage'
import { PostListPage } from './pages/PostListPage'
import './index.css'

function App() {

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <strong>GlowBoard</strong>
          <span>Global beauty and fashion topics</span>
        </div>

        <nav>
          <Link to="/login">Log in</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<PostListPage />} />
        <Route path="/login" element={<LoginPage  />} />
        <Route path="/posts/:postId" element={<PostDetailPage />} />
      </Routes>
    </div>
  )
}

export default App
