import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
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
      <main className="mx-auto w-full max-w-[1180px] px-4 py-7 pb-16 md:px-8">
        <Routes>
          <Route path="/" element={<PostListPage />} />
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
