import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "sonner";
import { membersService } from "@/services/members.service";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Member } from "@/types/models";

export function MembersManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["dashboard-members", page, search],
    queryFn: () => membersService.getAll({ page, limit: 10, search }),
  });

  const remove = useMutation({
    mutationFn: membersService.remove,
    onSuccess: () => {
      toast.success("Đã xóa thành viên");
      qc.invalidateQueries({ queryKey: ["dashboard-members"] });
    },
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Member["status"] }) =>
      membersService.changeStatus(id, status || "ACTIVE"),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái thành viên");
      qc.invalidateQueries({ queryKey: ["dashboard-members"] });
    },
  });

  if (query.isLoading) return <Loading />;
  if (query.isError) return <ErrorState onRetry={query.refetch} />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý thành viên</h1>
        <Link
          to="/dashboard/members/create"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Thêm thành viên
        </Link>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm theo tên/email"
        className="mb-4 rounded-md border border-slate-300 px-3 py-2"
      />

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Họ tên</th>
              <th className="px-3 py-2 text-left">Tên thánh</th>
              <th className="px-3 py-2 text-left">Trường học</th>
              <th className="px-3 py-2 text-left">MSSV</th>
              <th className="px-3 py-2 text-left">Vị trí</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Ngày tạo</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(query.data?.data || []).map((member: Member) => (
              <tr key={member.id} className="border-t border-slate-100">
                <td className="px-3 py-2 text-xs text-slate-500">
                  {member.id}
                </td>
                <td className="px-3 py-2">
                  {member.name ||
                    member.fullName ||
                    `${member.lastName || ""} ${member.firstName || ""}`.trim()}
                </td>
                <td className="px-3 py-2">{member.saintName || "--"}</td>
                <td className="px-3 py-2">{member.school || "--"}</td>
                <td className="px-3 py-2">{member.studentId || "--"}</td>
                <td className="px-3 py-2">{member.position || "--"}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={member.status || "ACTIVE"} />
                    <select
                      value={member.status || "ACTIVE"}
                      onChange={(e) =>
                        changeStatus.mutate({
                          id: member.id,
                          status: e.target.value as Member["status"],
                        })
                      }
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="ALUMNI">ALUMNI</option>
                    </select>
                  </div>
                </td>
                <td className="px-3 py-2">
                  {member.createdAt
                    ? dayjs(member.createdAt).format("DD/MM/YYYY")
                    : "--"}
                </td>
                <td className="px-3 py-2">
                  <Link
                    to={`/dashboard/members/${member.id}/edit`}
                    className="mr-3 text-blue-600"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => remove.mutate(member.id)}
                    className="text-red-600"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage((v) => v - 1)}
          className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50"
        >
          Prev
        </button>
        <span>Trang {page}</span>
        <button
          onClick={() => setPage((v) => v + 1)}
          className="rounded-md border border-slate-300 px-3 py-1"
        >
          Next
        </button>
      </div>
    </div>
  );
}
