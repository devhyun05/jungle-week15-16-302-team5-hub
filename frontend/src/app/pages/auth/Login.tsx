import { Navigate, useSearchParams } from "react-router";
import { BookOpenCheck, Github, MessageSquareText, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { useAuth } from "../../contexts/AuthContext";

function GoogleMark() {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-bold shadow-sm">
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
    <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex min-h-[520px] flex-col justify-between bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-8 sm:p-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-600 text-lg font-bold text-white">J</div>
            <div>
              <p className="text-sm font-semibold text-emerald-700">JungleLog</p>
              <h1 className="text-3xl font-bold tracking-normal text-slate-950">학습 기록을 포트폴리오로 연결합니다</h1>
            </div>
          </div>
          <p className="mt-6 max-w-xl text-sm leading-6 text-slate-600">
            정글에서 남긴 학습 로그, 트러블슈팅, 회고, GitHub 프로젝트를 한곳에 모아 포트폴리오 자료로 관리합니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: BookOpenCheck, title: "기록", text: "학습 로그와 회고" },
            { icon: Github, title: "GitHub", text: "프로젝트 연결" },
            { icon: MessageSquareText, title: "피드백", text: "코치 리뷰 요청" },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-white/70 bg-white/80 p-4 shadow-sm">
              <item.icon className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-[520px] items-center p-8 sm:p-10">
        <Card className="w-full border-0 shadow-none">
          <CardContent className="space-y-5 p-0">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Google OAuth
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-950">JungleLog 시작하기</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Google 계정으로 로그인해 내 기록과 포트폴리오 작업 공간으로 이동합니다.</p>
            </div>

            <Button type="button" className="h-12 w-full gap-3 bg-emerald-600 text-white hover:bg-emerald-700" onClick={loginWithGoogle}>
              <GoogleMark />
              Google로 계속하기
            </Button>

            {authError && (
              <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                Google 로그인 처리 중 문제가 발생했습니다. 다시 시도해 주세요.
                <p className="mt-1 text-xs text-red-600">{authError}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
