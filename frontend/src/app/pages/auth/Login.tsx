import { useNavigate } from "react-router";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";

export function Login() {
  // TODO backend: 실제 Google OAuth redirect와 JWT 발급은 인증 API 구현 단계에서 연결한다.
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.localStorage.setItem("junglelog-mock-role", "STUDENT");
    window.localStorage.setItem("junglelog-mock-approval-status", "승인 대기");
    navigate("/pending-approval");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>Google 계정으로 JungleLog 학습 기록을 이어갑니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button type="button" variant="outline" className="h-11 w-full gap-3" onClick={handleGoogleLogin}>
          <span className="text-base font-semibold text-slate-700">G</span>
          Google로 계속하기
        </Button>
        <p className="text-sm leading-6 text-slate-500">
          처음 로그인한 Google 계정은 학생 계정으로 자동 등록됩니다.
          mock 단계에서는 승인 대기 상태로 이동하며, 코치 권한은 운영자가 별도로 지정합니다.
        </p>
      </CardContent>
    </Card>
  );
}
