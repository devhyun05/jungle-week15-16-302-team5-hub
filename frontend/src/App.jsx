import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import PostListPage from "./pages/PostListPage.jsx";
import PostDetailPage from "./pages/PostDetailPage.jsx";
import PostEditorPage from "./pages/PostEditorPage.jsx";

export default function App() {
  // TODO: 인증 상태를 확인하고 보호된 route를 분리한다.
  return (
    <BrowserRouter>
      <Header />
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/posts" element={<PostListPage />} />
          <Route path="/posts/new" element={<PostEditorPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/posts/:postId/edit" element={<PostEditorPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
