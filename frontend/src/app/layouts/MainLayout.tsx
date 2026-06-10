import { useMemo, useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import {
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  LayoutDashboard,
  List,
  PenSquare,
  Search,
  Settings,
  UserCheck,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { notifications, type UserRole } from "../data/mockData";

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
  { name: "대시보드", path:"/", icon: LayoutDashboard },
  { name: "코치 리뷰 인박스", path: "/coach-review", icon: UserCheck },
  { name: "전체 게시글", path: "/posts", icon: List },
  { name: "설정", path: "/settings", icon: Settings },
];

// MainLayout이 Outlet 아래의 자식 페이지들에게 넘기는 공통 context입니다.
export type MainLayoutContext = {
  role: UserRole;
  setRole: (role: UserRole) => void;
};

// 지금은 백엔드 로그인 전이라 localStorage에 저장된 mock role을 초기값으로 사용합니다.
function getInitialRole(): UserRole {
  const savedRole = window.localStorage.getItem("junglelog-mock-role");
  return savedRole === "COACH" ? "COACH" : "STUDENT";
}

export function MainLayout() {
  // roleState가 바뀌면 사이드바 메뉴, 프로필, 접근 가능한 화면이 함께 바뀝니다.
  const [roleState, setRoleState] = useState<UserRole>(getInitialRole);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const setRole = (nextRole: UserRole) => {
    setRoleState(nextRole);
    window.localStorage.setItem("junglelog-mock-role", nextRole);
  };

  // 역할에 따라 사이드바 메뉴 구성이 달라집니다.
  const navItems = roleState === "STUDENT" ? studentNavItems : coachNavItems;
  const profile = useMemo(
    () =>
      roleState === "STUDENT"
        ? { name: "김정글", initial: "김", badge: "STUDENT" }
        : { name: "이코치", initial: "이", badge: "COACH" },
    [roleState],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2 p-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 font-bold text-white">
            J
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">JungleLog</span>
        </div>

        <div className="mx-4 mb-4 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <div className="grid grid-cols-2 gap-1">
            {(["STUDENT", "COACH"] as UserRole[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRole(item)}
                className={`rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
                  roleState === item ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <p className="mt-2 px-1 text-[11px] text-slate-400">mock role 전환</p>
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
              <Badge variant={roleState === "STUDENT" ? "success" : "outline"} className="px-1.5 py-0 text-[10px]">
                {profile.badge}
              </Badge>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative hidden w-full max-w-md sm:block">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder="게시글, 트러블슈팅, 태그 검색..."
                className="w-full bg-slate-50 pl-9"
              />
            </div>
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
                // 지금은 서버 알림이 아니라 mock notifications 배열을 드롭다운으로 보여줍니다.
                <div className="absolute right-0 top-11 z-20 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">알림</p>
                    <p className="text-xs text-slate-500">mock 데이터로 표시되는 알림입니다.</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {notifications.map((notification) => (
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

            {roleState === "STUDENT" ? (
              <Button asChild className="gap-2">
                <Link to="/posts/new">
                  <PenSquare className="h-4 w-4" />
                  <span>글쓰기</span>
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="gap-2">
                <Link to="/coach-review">
                  <UserCheck className="h-4 w-4" />
                  <span>리뷰 인박스</span>
                </Link>
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          {/* 자식 라우트는 useOutletContext로 role과 setRole을 읽을 수 있습니다. */}
          <Outlet context={{ role: roleState, setRole } satisfies MainLayoutContext} />
        </main>
      </div>
    </div>
  );
}
