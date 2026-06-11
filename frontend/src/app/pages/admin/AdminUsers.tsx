import { useMemo, useState } from "react";
import { ShieldCheck, UserCheck, UserX } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { userAccounts, type ApprovalStatus, type UserAccount, type UserRole } from "../../data/mockData";

const roleOptions: UserRole[] = ["STUDENT", "COACH", "ADMIN"];
const statusOptions: ApprovalStatus[] = ["승인 대기", "승인 완료", "거절", "정지"];

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

export function AdminUsers() {
  const [users, setUsers] = useState<UserAccount[]>(userAccounts);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, UserRole>>(() =>
    Object.fromEntries(userAccounts.map((user) => [user.id, user.role])),
  );
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "전체">("승인 대기");
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const statusMatches = statusFilter === "전체" || user.approvalStatus === statusFilter;
      const textMatches =
        !normalizedQuery ||
        [user.name, user.email, user.role, user.track ?? "", user.coachField ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return statusMatches && textMatches;
    });
  }, [query, statusFilter, users]);

  const pendingCount = users.filter((user) => user.approvalStatus === "승인 대기").length;
  const approvedCount = users.filter((user) => user.approvalStatus === "승인 완료").length;
  const coachCount = users.filter((user) => user.role === "COACH" && user.approvalStatus === "승인 완료").length;

  const updateUser = (userId: string, nextValues: Partial<UserAccount>) => {
    // TODO backend: 실제 사용자 승인/권한 변경 API는 Google OAuth/JWT 인증 구현 후 연결한다.
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              ...nextValues,
              approvedAt: nextValues.approvalStatus === "승인 완료" ? "방금 전" : user.approvedAt,
              approvedBy: nextValues.approvalStatus === "승인 완료" ? "정글 운영자" : user.approvedBy,
            }
          : user,
      ),
    );
  };

  const setRoleDraft = (userId: string, role: UserRole) => {
    setRoleDrafts((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  const approveUser = (user: UserAccount) => {
    updateUser(user.id, {
      role: roleDrafts[user.id] ?? user.role,
      approvalStatus: "승인 완료",
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Badge variant="success">관리자</Badge>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">사용자 승인 관리</h1>
          <p className="mt-1 text-sm text-slate-500">
            역할을 선택한 뒤 승인 적용을 누르면 해당 권한과 승인 상태가 함께 적용됩니다.
          </p>
        </div>
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
              onChange={(event) => setStatusFilter(event.target.value as ApprovalStatus | "전체")}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="전체">전체 상태</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                    <Badge variant={getStatusVariant(user.approvalStatus)}>{getStatusLabel(user.approvalStatus)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    신청일 {user.requestedAt}
                    {user.approvedAt ? ` · 승인 ${user.approvedAt}` : ""}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    value={roleDrafts[user.id] ?? user.role}
                    onChange={(event) => setRoleDraft(user.id, event.target.value as UserRole)}
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {getRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                  <Button type="button" size="sm" className="gap-1" onClick={() => approveUser(user)}>
                    <UserCheck className="h-3.5 w-3.5" />
                    승인 적용
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="gap-1" onClick={() => updateUser(user.id, { approvalStatus: "정지" })}>
                    <UserX className="h-3.5 w-3.5" />
                    정지
                  </Button>
                  <Button type="button" size="sm" variant="destructive" className="gap-1" onClick={() => updateUser(user.id, { approvalStatus: "거절" })}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    거절
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              조건에 맞는 사용자가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
