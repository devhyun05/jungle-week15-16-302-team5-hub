import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PostListPage from "./pages/PostListPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostEditorPage from "./pages/PostEditorPage";
import AgentDiagnosisPage from "./pages/AgentDiagnosisPage";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="mx-auto max-w-[1200px] px-5 py-9 pb-[72px] md:px-12">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/posts" element={<PostListPage />} />
          <Route path="/posts/new" element={<PostEditorPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/posts/:postId/edit" element={<PostEditorPage />} />
          <Route path="/agent" element={<AgentDiagnosisPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
