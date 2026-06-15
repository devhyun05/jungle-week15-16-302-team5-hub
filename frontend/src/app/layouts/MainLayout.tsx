import { useState } from "react";
import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router";
import {
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  Clock,
  LayoutDashboard,
  List,
  LogOut,
  PenSquare,
  Settings,
  UserCheck,
  Users,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import type { ApprovalStatus, CurrentUser, UserRole } from "../api/auth";

const studentNavItems = [
  { name: "대시보드", path: "/", icon: LayoutDashboard },
  { name: "전체 게시글", path: "/posts", icon: List },
  { name: "내 기록", path: "/my-records", icon: BookOpen },
  { name: "포트폴리오 관리", path: "/portfolio", icon: Briefcase },
  { name: "AI 도우미", path: "/ai-assistant", icon: Bot },
  { name: "코치 리뷰 요청", path: "/coach-review", icon: UserCheck },
  { name: "설정", path: "/settings", icon: Settings },
];

const coachNavItems = [
  { name: "대시보드", path: "/", icon: LayoutDashboard },
  { name: "코치 리뷰 인박스", path: "/coach-review", icon: UserCheck },
  { name: "전체 게시글", path: "/posts", icon: List },
  { name: "설정", path: "/settings", icon: Settings },
];

const adminNavItems = [
  { name: "대시보드", path: "/", icon: LayoutDashboard },
  { name: "사용자 승인", path: "/admin/users", icon: Users },
  { name: "전체 게시글", path: "/posts", icon: List },
  { name: "설정", path: "/settings", icon: Settings },
];

const pendingNavItems = [
  { name: "승인 상태", path: "/pending-approval", icon: Clock },
];

const sampleNotifications = [
  { id: "notification-feedback", message: "코치 피드백이 도착했습니다.", time: "방금 전" },
  { id: "notification-review", message: "포트폴리오 리뷰 요청이 승인되었습니다.", time: "1시간 전" },
  { id: "notification-ai", message: "AI 초안 생성이 완료되었습니다.", time: "어제" },
];

export type MainLayoutContext = {
  user: CurrentUser;
  role: UserRole;
  approvalStatus: ApprovalStatus;
  refreshCurrentUser: () => Promise<CurrentUser | null>;
};

function getRoleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    STUDENT: "학생",
    COACH: "코치",
    ADMIN: "관리자",
  };

  return labels[role];
}

function getProfileInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "J";
}

export function MainLayout() {
  const navigate = useNavigate();
  const { user, isLoading, logout, refreshCurrentUser } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
          로그인 상태를 확인하고 있습니다.
        </div>
      </div>
    );
  }

  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  const isApproved = user.approvalStatus === "승인 완료";
  const navItems = !isApproved
    ? pendingNavItems
    : user.role === "STUDENT"
      ? studentNavItems
      : user.role === "COACH"
        ? coachNavItems
        : adminNavItems;
  const profile = {
    name: user.name,
    initial: getProfileInitial(user.name),
    badge: getRoleLabel(user.role),
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2 p-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 font-bold text-white">
            J
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">JungleLog</span>
        </div>

        <div className="mx-4 mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3">
          <p className="text-xs font-semibold text-emerald-700">Google OAuth 로그인</p>
          <p className="mt-1 truncate text-sm font-medium text-slate-900">{user.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant={user.role === "STUDENT" ? "success" : "outline"} className="px-1.5 py-0 text-[10px]">
              {getRoleLabel(user.role)}
            </Badge>
            <Badge variant={isApproved ? "success" : "warning"} className="px-1.5 py-0 text-[10px]">
              {user.approvalStatus}
            </Badge>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
              {profile.initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{profile.name}</p>
              <p className="truncate text-xs text-slate-500">{profile.badge}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label="로그아웃" onClick={handleLogout}>
              <LogOut className="h-4 w-4 text-slate-500" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium text-slate-500">JungleLog</p>
            <p className="text-sm font-semibold text-slate-900">
              {isApproved ? `${getRoleLabel(user.role)} 서비스 화면` : "승인 대기 화면"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="알림 열기"
                onClick={() => setIsNotificationOpen((prev) => !prev)}
              >
                <Bell className="h-5 w-5 text-slate-600" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              </Button>

              {isNotificationOpen && (
                <div className="absolute right-0 top-11 z-20 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">알림</p>
                    <p className="text-xs text-slate-500">알림 API 연결 전 샘플 데이터입니다.</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {sampleNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        className="block w-full px-4 py-3 text-left transition-colors hover:bg-slate-50"
                      >
                        <p className="text-sm font-medium text-slate-800">{notification.message}</p>
                        <p className="mt-1 text-xs text-slate-400">{notification.time}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!isApproved ? (
              <Button asChild variant="outline" className="gap-2">
                <Link to="/pending-approval">
                  <Clock className="h-4 w-4" />
                  <span>승인 상태</span>
                </Link>
              </Button>
            ) : user.role === "STUDENT" ? (
              <Button asChild className="gap-2">
                <Link to="/posts/new">
                  <PenSquare className="h-4 w-4" />
                  <span>글쓰기</span>
                </Link>
              </Button>
            ) : user.role === "COACH" ? (
              <Button asChild variant="outline" className="gap-2">
                <Link to="/coach-review">
                  <UserCheck className="h-4 w-4" />
                  <span>리뷰 인박스</span>
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="gap-2">
                <Link to="/admin/users">
                  <Users className="h-4 w-4" />
                  <span>사용자 승인</span>
                </Link>
              </Button>
            )}

            <Button type="button" variant="ghost" className="gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>로그아웃</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <Outlet
            context={{
              user,
              role: user.role,
              approvalStatus: user.approvalStatus,
              refreshCurrentUser,
            } satisfies MainLayoutContext}
          />
        </main>
      </div>
    </div>
  );
}
