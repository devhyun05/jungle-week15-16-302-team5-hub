import { createBrowserRouter } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { RoleGate } from "./components/RoleGate";

// URL에 연결할 페이지 컴포넌트들을 한 곳에서 모읍니다.
import { Login } from "./pages/auth/Login";
import { PendingApproval } from "./pages/auth/PendingApproval";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Posts } from "./pages/posts/Posts";
import { PostDetail } from "./pages/posts/PostDetail";
import { PostEdit } from "./pages/posts/PostEdit";
import { MyRecords } from "./pages/posts/MyRecords";
import { Portfolio } from "./pages/portfolio/Portfolio";
import { AIAssistant } from "./pages/ai/AIAssistant";
import { CoachReview } from "./pages/coach/CoachReview";
import { Settings } from "./pages/settings/Settings";

export const router = createBrowserRouter([
  {
    // Google 로그인처럼 서비스 본문과 분리된 인증 화면 묶음입니다.
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
    ],
  },
  {
    // MainLayout은 사이드바, 헤더, role 상태를 감싸고 children 화면만 바꿔줍니다.
    path: "/",
    element: <MainLayout />,
    children: [
      {
        // index route는 "/" 주소로 들어왔을 때 보여줄 기본 화면입니다.
        index: true,
        element: (
          <RoleGate allowedRoles={["STUDENT", "COACH", "ADMIN"]}>
            <Dashboard />
          </RoleGate>
        ),
      },
      { path: "pending-approval", element: <PendingApproval /> },
      {
        path: "admin/users",
        element: (
          <RoleGate allowedRoles={["ADMIN"]}>
            <AdminUsers />
          </RoleGate>
        ),
      },
      {
        path: "posts",
        element: (
          <RoleGate allowedRoles={["STUDENT", "COACH", "ADMIN"]}>
            <Posts />
          </RoleGate>
        ),
      },
      {
        // 글쓰기, 내 기록, 포트폴리오, AI 도우미는 학생 중심 화면이며 관리자는 직접 URL로 확인할 수 있습니다.
        path: "posts/new",
        element: (
          <RoleGate allowedRoles={["STUDENT", "ADMIN"]}>
            <PostEdit />
          </RoleGate>
        ),
      },
      // ":id" 값은 PostDetail에서 useParams로 읽어 상세 게시글을 찾습니다.
      {
        path: "posts/:id",
        element: (
          <RoleGate allowedRoles={["STUDENT", "COACH", "ADMIN"]}>
            <PostDetail />
          </RoleGate>
        ),
      },
      {
        path: "posts/:id/edit",
        element: (
          <RoleGate allowedRoles={["STUDENT", "ADMIN"]}>
            <PostEdit />
          </RoleGate>
        ),
      },
      {
        path: "my-records",
        element: (
          <RoleGate allowedRoles={["STUDENT", "ADMIN"]}>
            <MyRecords />
          </RoleGate>
        ),
      },
      {
        path: "portfolio",
        element: (
          <RoleGate allowedRoles={["STUDENT", "ADMIN"]}>
            <Portfolio />
          </RoleGate>
        ),
      },
      {
        path: "ai-assistant",
        element: (
          <RoleGate allowedRoles={["STUDENT", "ADMIN"]}>
            <AIAssistant />
          </RoleGate>
        ),
      },
      // CoachReview는 내부에서 STUDENT/COACH role에 따라 다른 화면을 보여줍니다.
      {
        path: "coach-review",
        element: (
          <RoleGate allowedRoles={["STUDENT", "COACH", "ADMIN"]}>
            <CoachReview />
          </RoleGate>
        ),
      },
      {
        path: "settings",
        element: (
          <RoleGate allowedRoles={["STUDENT", "COACH", "ADMIN"]}>
            <Settings />
          </RoleGate>
        ),
      },
    ],
  },
]);
