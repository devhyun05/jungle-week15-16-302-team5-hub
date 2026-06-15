import { Clock, LogIn, LogOut, RefreshCw } from "lucide-react";
import { Link, useNavigate, useOutletContext } from "react-router";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { useAuth } from "../../contexts/AuthContext";
import type { ApprovalStatus, UserRole } from "../../api/auth";
import type { MainLayoutContext } from "../../layouts/MainLayout";

const statusMessages: Record<ApprovalStatus, { title: string; description: string }> = {
  "승인 대기": {
    title: "운영자의 승인을 기다리고 있습니다",
    description: "Google 로그인은 완료됐지만 JungleLog 사용 권한은 아직 승인되지 않았습니다.",
  },
  거절: {
    title: "사용 권한이 승인되지 않았습니다",
    description: "계정 상태 확인이 필요합니다. 정글 운영자에게 문의해 주세요.",
  },
  정지: {
    title: "사용 권한이 일시 정지되었습니다",
    description: "현재 계정은 서비스 접근이 제한된 상태입니다.",
  },
  "승인 완료": {
    title: "이미 승인된 계정입니다",
    description: "대시보드로 이동해 JungleLog를 사용할 수 있습니다.",
  },
};

function getRoleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    STUDENT: "학생",
    COACH: "코치",
    ADMIN: "관리자",
  };

  return labels[role];
}

export function PendingApproval() {
  const { user, approvalStatus, role } = useOutletContext<MainLayoutContext>();
  const { logout, refreshCurrentUser } = useAuth();
  const navigate = useNavigate();
  const message = statusMessages[approvalStatus];
  const isApproved = approvalStatus === "승인 완료";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
      <Card className="w-full border-emerald-100">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <Clock className="h-7 w-7" />
          </div>
          <Badge variant={isApproved ? "success" : "warning"}>{approvalStatus}</Badge>
          <h1 className="mt-4 text-xl font-bold text-slate-900">{message.title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{message.description}</p>
          <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">계정:</span> {user.email}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">현재 역할:</span> {getRoleLabel(role)}
            </p>
          </div>
          {isApproved ? (
            <Button asChild className="mt-6 gap-2">
              <Link to="/">
                <LogIn className="h-4 w-4" />
                대시보드로 이동
              </Link>
            </Button>
          ) : (
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button type="button" className="gap-2" onClick={() => void refreshCurrentUser()}>
                <RefreshCw className="h-4 w-4" />
                승인 상태 다시 확인
              </Button>
              <Button type="button" variant="outline" className="gap-2" onClick={() => void handleLogout()}>
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
