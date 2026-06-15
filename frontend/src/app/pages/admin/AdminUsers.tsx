import { useEffect, useMemo, useState } from "react";
import { RefreshCw, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { getAdminUsers, updateAdminUser, type AdminUser } from "../../api/admin";
import type { ApprovalStatus, UserRole } from "../../api/auth";

const roleOptions: UserRole[] = ["STUDENT", "COACH", "ADMIN"];
const statusOptions: ApprovalStatus[] = ["승인 대기", "승인 완료", "거절", "정지"];
const statusFilterOptions = ["전체", ...statusOptions] as const;

type StatusFilter = (typeof statusFilterOptions)[number];

function getStatusLabel(status: ApprovalStatus) {
  return status;
}

function getRoleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    STUDENT: "학생",
    COACH: "코치",
    ADMIN: "관리자",
  };

  return labels[role];
}

function getStatusVariant(status: ApprovalStatus) {
  if (status === "승인 완료") return "success";
  if (status === "승인 대기") return "warning";
  if (status === "거절" || status === "정지") return "destructive";
  return "secondary";
}

function formatDate(dateText: string | null) {
  if (!dateText) {
    return "없음";
  }

  return new Date(dateText).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roleDrafts, setRoleDrafts] = useState<Record<number, UserRole>>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("승인 대기");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  async function loadUsers() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getAdminUsers();

      setUsers(data.items);
      setRoleDrafts(Object.fromEntries(data.items.map((user) => [user.id, user.role])));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "사용자 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const statusMatches = statusFilter === "전체" || user.approvalStatus === statusFilter;
      const textMatches =
        !normalizedQuery ||
        [user.name, user.email, user.role, user.approvalStatus, user.approvalNote ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return statusMatches && textMatches;
    });
  }, [query, statusFilter, users]);

  const pendingCount = users.filter((user) => user.approvalStatus === "승인 대기").length;
  const approvedCount = users.filter((user) => user.approvalStatus === "승인 완료").length;
  const coachCount = users.filter((user) => user.role === "COACH" && user.approvalStatus === "승인 완료").length;

  const setRoleDraft = (userId: number, role: UserRole) => {
    setRoleDrafts((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  const updateUser = async (user: AdminUser, nextValues: { role?: UserRole; approvalStatus?: ApprovalStatus; approvalNote?: string }) => {
    setUpdatingUserId(user.id);
    setErrorMessage("");

    try {
      const updatedUser = await updateAdminUser(user.id, {
        role: nextValues.role ?? roleDrafts[user.id] ?? user.role,
        approvalStatus: nextValues.approvalStatus,
        approvalNote: nextValues.approvalNote ?? null,
      });

      setUsers((prev) => prev.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
      setRoleDrafts((prev) => ({
        ...prev,
        [updatedUser.id]: updatedUser.role,
      }));
      setSuccessMessage(`${updatedUser.name}님의 권한 상태를 저장했습니다.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "사용자 권한을 변경하지 못했습니다.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Badge variant="success">관리자</Badge>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">사용자 승인 관리</h1>
          <p className="mt-1 text-sm text-slate-500">
            Google 로그인으로 들어온 사용자를 학생, 코치, 관리자로 승인하고 서비스 접근 상태를 관리합니다.
          </p>
        </div>
        <Button type="button" variant="outline" className="gap-2" onClick={() => void loadUsers()} disabled={isLoading}>
          <RefreshCw className="h-4 w-4" />
          새로고침
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">승인 대기</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">승인 완료 사용자</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{approvedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">승인 완료 코치</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{coachCount}</p>
          </CardContent>
        </Card>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      )}

      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">사용자 목록</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이름, 이메일, 역할 검색"
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
            >
              {statusFilterOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "전체" ? "전체 상태" : getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <div className="rounded-lg border border-slate-200 p-8 text-center text-sm text-slate-500">사용자를 불러오는 중입니다.</div>}

          {!isLoading &&
            filteredUsers.map((user) => {
              const isProtectedUser = user.isSuperAdmin;

              return (
                <div key={user.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                        <Badge variant={getStatusVariant(user.approvalStatus)}>{getStatusLabel(user.approvalStatus)}</Badge>
                        {isProtectedUser && <Badge variant="success">최고관리자</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        요청 {formatDate(user.requestedAt)}
                        {user.approvedAt ? ` ? 처리 ${formatDate(user.approvedAt)}` : ""}
                        {user.approvedBy ? ` ? 담당 ${user.approvedBy}` : ""}
                      </p>
                      {isProtectedUser && (
                        <p className="mt-2 text-xs font-medium text-emerald-700">
                          ADMIN_EMAILS로 보호되는 최고관리자 계정이라 역할과 승인 상태를 바꿀 수 없습니다.
                        </p>
                      )}
                      {user.approvalNote && <p className="mt-2 text-xs text-slate-500">메모: {user.approvalNote}</p>}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <select
                        value={roleDrafts[user.id] ?? user.role}
                        onChange={(event) => setRoleDraft(user.id, event.target.value as UserRole)}
                        disabled={isProtectedUser || updatingUserId === user.id}
                        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {getRoleLabel(role)}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        size="sm"
                        className="gap-1"
                        onClick={() => void updateUser(user, { approvalStatus: "승인 완료", approvalNote: "관리자 승인" })}
                        disabled={isProtectedUser || updatingUserId === user.id}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        승인 적용
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => void updateUser(user, { approvalStatus: "정지", approvalNote: "관리자 정지 처리" })}
                        disabled={isProtectedUser || updatingUserId === user.id}
                      >
                        <UserX className="h-3.5 w-3.5" />
                        정지
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        onClick={() => void updateUser(user, { approvalStatus: "거절", approvalNote: "관리자 거절 처리" })}
                        disabled={isProtectedUser || updatingUserId === user.id}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        거절
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

          {!isLoading && filteredUsers.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              조건에 맞는 사용자가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
