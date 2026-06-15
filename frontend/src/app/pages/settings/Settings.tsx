
import { Bot, Github, Info, Lock, Save, User } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../contexts/AuthContext";

export function Settings() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">설정</h1>
        <p className="mt-1 text-slate-500">프로필, GitHub 연동, AI 설정을 관리합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            프로필
          </CardTitle>
          <CardDescription>프로필 수정 API는 다음 단계에서 연결할 예정입니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={user?.name ?? ""} readOnly />
          <Input value={user?.email ?? ""} readOnly />
          <Button disabled>
            <Save className="mr-2 h-4 w-4" />
            프로필 저장 준비 중
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Github className="h-4 w-4" />
            GitHub 연동
          </CardTitle>
          <CardDescription>GitHub API/MCP 연동은 백엔드 연결 후 구현 예정입니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div>
              <p className="font-semibold text-slate-900">GitHub 계정 연동</p>
              <p className="text-sm text-slate-500">현재는 포트폴리오 프로젝트별 repo URL 등록 방식으로 사용합니다.</p>
            </div>
            <Badge variant="outline">준비 중</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4" />
            AI 설정
          </CardTitle>
          <CardDescription>OpenAI API Key와 모델 선택은 서버 환경변수로 관리할 예정입니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <Info className="mt-0.5 h-4 w-4 text-slate-400" />
            <p>클라이언트에 API Key를 직접 저장하지 않습니다. 백엔드에서 권한과 호출량을 관리합니다.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Lock className="h-4 w-4" />
            실제 보안 설정은 백엔드 연결 후 구현 예정입니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
