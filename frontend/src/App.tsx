import type { ReactElement } from "react"
import { Navigate, Routes, Route } from "react-router"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import ProfileEdit from "./pages/ProfileEdit"
import PostCreate from "./pages/PostCreate"
import PostEdit from "./pages/PostEdit"
import PostDetails from "./pages/PostDetails"
import Header from "./components/Header"
import { useMockAuth } from "./lib/mockAuth"
import "./App.css"

type RequireAuthProps = {
  children: ReactElement
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isLoggedIn } = useMockAuth()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/profile-edit"
            element={
              <RequireAuth>
                <ProfileEdit />
              </RequireAuth>
            }
          />
          <Route
            path="/post-create"
            element={
              <RequireAuth>
                <PostCreate />
              </RequireAuth>
            }
          />
          <Route
            path="/post-edit"
            element={
              <RequireAuth>
                <PostEdit />
              </RequireAuth>
            }
          />
          <Route path="/post-details" element={<PostDetails />} />
          <Route path="/post-details/:postId" element={<PostDetails />} />
        </Routes>
      </main>
    </>
  )
}

export default App
