import { Navigate, useSearchParams } from "react-router";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { useAuth } from "../../contexts/AuthContext";

function GoogleMark() {
  return (
    <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-base font-bold shadow-sm">
      <span className="bg-gradient-to-r from-blue-500 via-red-500 to-amber-400 bg-clip-text text-transparent">G</span>
    </span>
  );
}

export function Login() {
  const { user, isLoading, loginWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const authError = searchParams.get("authError");

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 text-sm text-slate-600">로그인 상태를 확인하고 있습니다.</CardContent>
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
    <div className="relative flex min-h-[640px] w-full max-w-5xl items-center justify-center overflow-hidden rounded-3xl border border-slate-100 bg-white px-6 py-12 shadow-sm sm:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[length:48px_48px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[360px] font-black leading-none text-emerald-950/[0.035]">
        J
      </div>
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white shadow-sm">J</div>
        <p className="mt-5 text-base font-bold text-slate-950">JungleLog</p>
        <div className="mt-10 h-1 w-12 rounded-full bg-emerald-500" />
        <h1 className="mt-7 text-5xl font-black tracking-normal text-slate-950 sm:text-6xl">SIGN IN</h1>

        <Button
          type="button"
          className="mt-10 h-14 w-full gap-3 rounded-none bg-slate-950 text-base font-bold text-white shadow-sm hover:bg-emerald-700"
          onClick={loginWithGoogle}
        >
          <GoogleMark />
          Google로 계속하기
        </Button>

        {authError && (
          <div className="mt-5 w-full rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
            Google 로그인 처리 중 문제가 발생했습니다. 다시 시도해 주세요.
            <p className="mt-1 text-xs text-red-600">{authError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
