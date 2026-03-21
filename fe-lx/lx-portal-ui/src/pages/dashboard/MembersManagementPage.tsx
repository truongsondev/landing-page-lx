import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { membersService } from "@/services/members.service";
import { usersService } from "@/services/users.service";
import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { AdminMemberUser } from "@/types/models";

export function MembersManagementPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<
    "ALL" | "UNVERIFIED" | "PENDING" | "ACTIVE"
  >("ALL");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "id" | "email" | "firstName" | "lastName" | "accountStatus"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [rejectingMember, setRejectingMember] =
    useState<AdminMemberUser | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      status: status === "ALL" ? undefined : status,
      sortBy,
      sortOrder,
    }),
    [page, limit, status, sortBy, sortOrder],
  );

  const query = useQuery({
    queryKey: ["dashboard-members", queryParams],
    queryFn: () => membersService.getAllAdminUsers(queryParams),
  });

  const moderationMutation = useMutation({
    mutationFn: async ({
      type,
      member,
      reason,
    }: {
      type: "approve" | "block" | "reject";
      member: AdminMemberUser;
      reason?: string;
    }) => {
      if (type === "approve") return usersService.approve(member.id);
      if (type === "block") return usersService.block(member.id);
      if (type === "reject")
        return usersService.reject(member.id, reason || "");
      throw new Error("Invalid moderation type");
    },
    onSuccess: (_unused, variables) => {
      toast.success(
        variables.type === "approve"
          ? "Duyệt thành viên thành công"
          : variables.type === "block"
            ? "Khóa thành viên thành công"
            : "Từ chối thành viên thành công",
      );
      setRejectingMember(null);
      setRejectReason("");
      void queryClient.invalidateQueries({ queryKey: ["dashboard-members"] });
    },
    onError: (_unused, variables) => {
      toast.error(
        variables.type === "approve"
          ? "Không thể duyệt thành viên"
          : variables.type === "block"
            ? "Không thể khóa thành viên"
            : "Không thể từ chối thành viên",
      );
    },
  });

  const typedError = query.error as AxiosError<{ message?: string }> | null;
  const errorMessage = typedError?.response?.data?.message;

  const members = query.data?.members || [];
  const total = query.data?.total || 0;
  const totalPages = query.data?.totalPages || 1;

  const getDisplayName = (member: AdminMemberUser) =>
    `${member.lastName || ""} ${member.firstName || ""}`.trim() || "--";

  const submitReject = () => {
    if (!rejectingMember) return;
    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    moderationMutation.mutate({
      type: "reject",
      member: rejectingMember,
      reason: trimmedReason,
    });
  };

  if (query.isLoading) return <Loading />;
  if (query.isError) {
    return (
      <ErrorState
        message={errorMessage || "Không thể tải danh sách thành viên quản trị"}
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý thành viên</h1>
        <p className="text-sm text-slate-500">Tổng: {total} thành viên</p>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Trạng thái</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(
                e.target.value as "ALL" | "UNVERIFIED" | "PENDING" | "ACTIVE",
              );
              setPage(1);
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2"
          >
            <option value="ALL">Tất cả</option>
            <option value="UNVERIFIED">UNVERIFIED</option>
            <option value="PENDING">PENDING</option>
            <option value="ACTIVE">ACTIVE</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Sắp xếp theo</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(
                e.target.value as
                  | "createdAt"
                  | "id"
                  | "email"
                  | "firstName"
                  | "lastName"
                  | "accountStatus",
              );
              setPage(1);
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2"
          >
            <option value="createdAt">createdAt</option>
            <option value="email">email</option>
            <option value="firstName">firstName</option>
            <option value="lastName">lastName</option>
            <option value="accountStatus">accountStatus</option>
            <option value="id">id</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Thứ tự</span>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as "asc" | "desc");
              setPage(1);
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2"
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Số dòng / trang</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">Avatar</th>
              <th className="px-3 py-2 text-left">Họ tên</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Account Status</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                className="border-t border-slate-100 align-middle"
              >
                <td className="px-3 py-2">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={getDisplayName(member)}
                      className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                      {member.firstName?.[0] || "U"}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">{getDisplayName(member)}</td>
                <td className="px-3 py-2">{member.email}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={member.accountStatus} />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {/* Approve: PENDING -> ACTIVE */}
                    <button
                      type="button"
                      title="Duyệt thành viên"
                      disabled={
                        member.accountStatus !== "PENDING" ||
                        moderationMutation.isPending
                      }
                      onClick={() =>
                        moderationMutation.mutate({ type: "approve", member })
                      }
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ✓
                    </button>
                    {/* Block: ACTIVE -> INACTIVE */}
                    <button
                      type="button"
                      title="Block thành viên"
                      disabled={
                        member.accountStatus !== "ACTIVE" ||
                        moderationMutation.isPending
                      }
                      onClick={() =>
                        moderationMutation.mutate({ type: "block", member })
                      }
                      className="rounded-md border border-yellow-300 bg-yellow-50 px-2 py-1 text-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ⛔
                    </button>
                    {/* Reject: PENDING -> INACTIVE, with reason */}
                    <button
                      type="button"
                      title="Reject thành viên"
                      disabled={
                        member.accountStatus !== "PENDING" ||
                        moderationMutation.isPending
                      }
                      onClick={() => {
                        setRejectingMember(member);
                        setRejectReason("");
                      }}
                      className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {members.length === 0 && (
        <EmptyState title="Không có thành viên phù hợp" />
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage((v) => v - 1)}
          className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Trang {page}/{totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((v) => v + 1)}
          className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {rejectingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Reject thành viên
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Thành viên: {getDisplayName(rejectingMember)}
            </p>
            <p className="text-xs text-slate-500">{rejectingMember.email}</p>

            <label
              className="mt-4 block text-sm text-slate-700"
              htmlFor="reject-reason"
            >
              Lý do reject
            </label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Nhập lý do từ chối thành viên..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (moderationMutation.isPending) return;
                  setRejectingMember(null);
                  setRejectReason("");
                }}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={moderationMutation.isPending}
                onClick={submitReject}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Xác nhận reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
