import type { ReactNode } from "react";
import { Link, useOutletContext } from "react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "./ui/Button";
import { Card, CardContent } from "./ui/Card";
import type { UserRole } from "../data/mockData";
import type { MainLayoutContext } from "../layouts/MainLayout";

type RoleGateProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  // MainLayout의 Outlet context에서 현재 mock role을 가져옵니다.
  const { role } = useOutletContext<MainLayoutContext>();
  const canAccess = allowedRoles.includes(role);

  if (canAccess) {
    // 허용된 role이면 감싸고 있던 실제 페이지를 그대로 보여줍니다.
    return <>{children}</>;
  }

  // 접근할 수 없는 role이면 역할에 맞는 기본 화면으로 돌려보냅니다.
  const fallbackPath = role === "COACH" ? "/coach-review" : "/";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
      <Card className="w-full border-amber-200 bg-amber-50">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">접근할 수 없는 화면입니다</h1>
          <p className="mt-2 text-sm text-slate-600">
            현재 mock role은 <span className="font-semibold">{role}</span>입니다. 이 화면은 해당 역할에서 사용할 수
            없습니다.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            백엔드 연결 후 실제 로그인 사용자 role과 JWT 기반 라우트 보호로 교체할 예정입니다.
          </p>
          <Button asChild className="mt-5">
            <Link to={fallbackPath}>{role === "COACH" ? "코치 리뷰 인박스로 이동" : "대시보드로 이동"}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
