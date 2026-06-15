import { Navigate, useSearchParams } from "react-router";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { useAuth } from "../../contexts/AuthContext";

export function Login() {
  const { user, isLoading, loginWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const authError = searchParams.get("authError");

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-sm text-slate-600">로그인 상태를 확인하고 있습니다.</CardContent>
      </Card>
    );
  }

  if (user?.approvalStatus === "승인 완료") {
    return <Navigate to="/" replace />;
  }

  if (user) {
    return <Navigate to="/pending-approval" replace />;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>Google 계정으로 JungleLog 학습 기록과 포트폴리오를 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button type="button" variant="outline" className="h-11 w-full gap-3" onClick={loginWithGoogle}>
          <span className="text-base font-semibold text-slate-700">G</span>
          Google로 계속하기
        </Button>
        {authError && (
          <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
            Google 로그인 처리 중 문제가 발생했습니다. 다시 시도해 주세요.
            <p className="mt-1 text-xs text-red-600">{authError}</p>
          </div>
        )}
        <div className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
          처음 로그인한 계정은 승인 대기 상태가 됩니다. 관리자가 학생, 코치, 관리자 역할을 승인하면 서비스 화면을
          사용할 수 있습니다.
        </div>
      </CardContent>
    </Card>
  );
}
