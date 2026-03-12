import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
              <th className="px-3 py-2 text-left">Họ tên</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">MSSV</th>
              <th className="px-3 py-2 text-left">Vị trí</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(query.data?.data || []).map((member: Member) => (
              <tr key={member.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  {member.fullName ||
                    `${member.lastName || ""} ${member.firstName || ""}`.trim()}
                </td>
                <td className="px-3 py-2">{member.email || "--"}</td>
                <td className="px-3 py-2">{member.studentId || "--"}</td>
                <td className="px-3 py-2">{member.position || "--"}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={member.status || "ACTIVE"} />
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
