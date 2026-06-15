
import { type FormEvent, useEffect, useState } from "react";
import { Bot, Github, Info, Lock, Save, Upload, User } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { resolveApiAssetUrl } from "../../api/client";
import { updateCurrentUserProfile } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";

export function Settings() {
  const { user, refreshCurrentUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(resolveApiAssetUrl(user?.profileImageUrl));
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setPreviewUrl(resolveApiAssetUrl(user?.profileImageUrl));
  }, [user]);

  const changeProfileImage = (file: File | null) => {
    setProfileImageFile(file);

    if (!file) {
      setPreviewUrl(resolveApiAssetUrl(user?.profileImageUrl));
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  };

  const submitProfile = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMessage("이름을 입력해주세요.");
      setNotice("");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setNotice("");

    try {
      await updateCurrentUserProfile({
        name: trimmedName,
        profileImage: profileImageFile,
      });
      await refreshCurrentUser();
      setProfileImageFile(null);
      setNotice("프로필이 저장되었습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "프로필을 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

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
          <CardDescription>Google 이메일은 로그인 식별값으로 유지하고, 표시 이름과 프로필 이미지는 직접 수정할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitProfile} className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
                {previewUrl ? <img src={previewUrl} alt="프로필 미리보기" className="h-full w-full object-cover" /> : user?.name.slice(0, 1) ?? "J"}
              </div>
              <div className="space-y-2">
                <label className="inline-flex h-9 cursor-pointer items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <Upload className="mr-2 h-4 w-4" />
                  프로필 이미지 선택
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={(event) => changeProfileImage(event.target.files?.[0] ?? null)}
                  />
                </label>
                <p className="text-xs text-slate-500">선택한 이미지는 프로필과 게시글, 댓글, 리뷰 화면의 아바타로 표시됩니다.</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">이름</span>
                <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={50} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">Google 이메일</span>
                <Input value={user?.email ?? ""} readOnly className="bg-slate-50 text-slate-500" />
              </label>
            </div>

            {errorMessage && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}
            {notice && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>}

            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "저장 중" : "프로필 저장"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Github className="h-4 w-4" />
            GitHub 연동
          </CardTitle>
          <CardDescription>GitHub 연동 정보는 포트폴리오 프로젝트와 작성 글에서 함께 활용됩니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div>
              <p className="font-semibold text-slate-900">GitHub 계정 연동</p>
              <p className="text-sm text-slate-500">현재는 포트폴리오 프로젝트별 repo URL 등록 방식으로 사용합니다.</p>
            </div>
            <Badge variant="outline">연동 전</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4" />
            AI 설정
          </CardTitle>
          <CardDescription>AI 생성 설정은 서버에서 안전하게 관리됩니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <Info className="mt-0.5 h-4 w-4 text-slate-400" />
            <p>브라우저에는 비밀 키를 저장하지 않고, 서버에서 권한과 호출량을 관리합니다.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Lock className="h-4 w-4" />
            세부 보안 정책은 서비스 운영 단계에서 조정합니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
