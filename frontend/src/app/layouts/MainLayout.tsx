import { useEffect, useState } from "react";
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
import { StudentHelpChatbot } from "../components/help/StudentHelpChatbot";
import { resolveApiAssetUrl } from "../api/client";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationApiItem,
} from "../api/notifications";
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
  { name: "코치 리뷰 인박스", path: "/coach-review", icon: UserCheck },
  { name: "전체 게시글", path: "/posts", icon: List },
  { name: "설정", path: "/settings", icon: Settings },
];

const adminNavItems = [
  { name: "사용자 승인", path: "/admin/users", icon: Users },
  { name: "전체 게시글", path: "/posts", icon: List },
  { name: "설정", path: "/settings", icon: Settings },
];

const pendingNavItems = [
  { name: "승인 상태", path: "/pending-approval", icon: Clock },
];

const APPROVAL_APPROVED = "승인 완료";

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

function getRoleHomePath(role: UserRole, approvalStatus: ApprovalStatus) {
  if (approvalStatus !== APPROVAL_APPROVED) {
    return "/pending-approval";
  }

  if (role === "COACH") {
    return "/coach-review";
  }

  if (role === "ADMIN") {
    return "/admin/users";
  }

  return "/";
}

function getProfileInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "J";
}

function formatNotificationTime(dateText: string) {
  const createdAt = new Date(dateText).getTime();
  const diffMinutes = Math.floor((Date.now() - createdAt) / 1000 / 60);

  if (Number.isNaN(createdAt)) {
    return "";
  }

  if (diffMinutes < 1) {
    return "방금 전";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  if (diffMinutes < 60 * 24) {
    return `${Math.floor(diffMinutes / 60)}시간 전`;
  }

  return new Date(dateText).toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
}

function isExternalUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function MainLayout() {
  const navigate = useNavigate();
  const { user, isLoading, logout, refreshCurrentUser } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationApiItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const loadNotifications = async () => {
    if (!user || user.approvalStatus !== APPROVAL_APPROVED) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }

    setIsNotificationLoading(true);
    setNotificationError("");

    try {
      const data = await getNotifications(10);

      setNotifications(data.items);
      setUnreadNotificationCount(data.unreadCount);
    } catch (error) {
      console.error(error);
      setNotificationError("알림을 불러오지 못했습니다.");
    } finally {
      setIsNotificationLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [user?.id, user?.approvalStatus]);

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

  const isApproved = user.approvalStatus === APPROVAL_APPROVED;
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
    imageUrl: resolveApiAssetUrl(user.profileImageUrl),
  };
  const homePath = getRoleHomePath(user.role, user.approvalStatus);
  const shouldShowStudentHelpChatbot = isApproved && user.role === "STUDENT";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const toggleNotifications = () => {
    setIsNotificationOpen((prev) => !prev);

    if (!isNotificationOpen) {
      void loadNotifications();
    }
  };

  const openNotification = async (notification: NotificationApiItem) => {
    if (!notification.isRead) {
      try {
        const updatedNotification = await markNotificationRead(notification.id);

        setNotifications((prev) => prev.map((item) => (item.id === updatedNotification.id ? updatedNotification : item)));
        setUnreadNotificationCount((prev) => Math.max(prev - 1, 0));
      } catch (error) {
        console.error(error);
      }
    }

    if (notification.linkUrl) {
      if (isExternalUrl(notification.linkUrl)) {
        window.open(notification.linkUrl, "_blank", "noreferrer");
      } else {
        navigate(notification.linkUrl);
      }
    }

    setIsNotificationOpen(false);
  };

  const readAllNotifications = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
      setUnreadNotificationCount(0);
    } catch (error) {
      console.error(error);
      setNotificationError("알림 상태를 변경하지 못했습니다.");
    }
  };

  const removeNotification = async (notificationId: number) => {
    try {
      const targetNotification = notifications.find((notification) => notification.id === notificationId);

      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));

      if (targetNotification && !targetNotification.isRead) {
        setUnreadNotificationCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error(error);
      setNotificationError("알림을 삭제하지 못했습니다.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <Link to={homePath} className="flex items-center gap-2 p-6 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 font-bold text-white">
            J
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">JungleLog</span>
        </Link>

        <div className="mx-4 mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3">
          <p className="text-xs font-semibold text-emerald-700">내 계정</p>
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
            {profile.imageUrl ? (
              <img src={profile.imageUrl} alt={`${profile.name} 프로필`} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                {profile.initial}
              </div>
            )}
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
                onClick={toggleNotifications}
              >
                <Bell className="h-5 w-5 text-slate-600" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
                    {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                  </span>
                )}
              </Button>

              {isNotificationOpen && (
                <div className="absolute right-0 top-11 z-20 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">알림</p>
                      <p className="text-xs text-slate-500">
                        {unreadNotificationCount > 0 ? `읽지 않은 알림 ${unreadNotificationCount}개` : "새 알림이 없습니다."}
                      </p>
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button type="button" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800" onClick={() => void readAllNotifications()}>
                        모두 읽음
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                    {isNotificationLoading && <p className="px-4 py-6 text-center text-sm text-slate-500">알림을 불러오는 중입니다.</p>}
                    {!isNotificationLoading && notificationError && <p className="px-4 py-6 text-center text-sm text-red-600">{notificationError}</p>}
                    {!isNotificationLoading && !notificationError && notifications.length === 0 && (
                      <p className="px-4 py-6 text-center text-sm text-slate-500">아직 도착한 알림이 없습니다.</p>
                    )}
                    {!isNotificationLoading && !notificationError && notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex w-full items-start gap-2 px-4 py-3 transition-colors hover:bg-slate-50 ${
                          notification.isRead ? "bg-white" : "bg-emerald-50/40"
                        }`}
                      >
                        <button
                          type="button"
                          className="min-w-0 flex-1 text-left"
                          onClick={() => void openNotification(notification)}
                        >
                          <div className="flex items-start gap-2">
                          {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
                          <div className="min-w-0">
                            <p className={`text-sm ${notification.isRead ? "font-medium text-slate-600" : "font-semibold text-slate-900"}`}>
                              {notification.message}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">{formatNotificationTime(notification.createdAt)}</p>
                          </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          className="rounded-md px-1.5 py-0.5 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          aria-label="알림 삭제"
                          onClick={() => void removeNotification(notification.id)}
                        >
                          x
                        </button>
                      </div>
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
      {shouldShowStudentHelpChatbot && <StudentHelpChatbot />}
    </div>
  );
}
