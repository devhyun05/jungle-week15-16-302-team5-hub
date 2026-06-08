import { Routes, Route } from "react-router"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import ProfileEdit from "./pages/ProfileEdit"
import PostEdit from "./pages/PostEdit"
import PostDetails from "./pages/PostDetails"
import Header from "./components/Header"
import "./App.css"

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route path="/post-edit" element={<PostEdit />} />
          <Route path="/post-details" element={<PostDetails />} />
          <Route path="/post-details/:postId" element={<PostDetails />} />
        </Routes>
      </main>
    </>
  )
}

export default App
