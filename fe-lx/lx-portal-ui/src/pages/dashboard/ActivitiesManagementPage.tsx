import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "sonner";
import { activitiesService } from "@/services/activities.service";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import type { Activity } from "@/types/models";

export function ActivitiesManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["dashboard-activities", page, search],
    queryFn: () => activitiesService.getAll({ page, limit: 10, search }),
  });

  const remove = useMutation({
    mutationFn: activitiesService.remove,
    onSuccess: () => {
      toast.success("Đã xóa hoạt động");
      qc.invalidateQueries({ queryKey: ["dashboard-activities"] });
    },
  });

  if (query.isLoading) return <Loading />;
  if (query.isError) return <ErrorState onRetry={query.refetch} />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý hoạt động</h1>
        <Link
          to="/dashboard/activities/create"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Tạo hoạt động mới
        </Link>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm theo tên"
        className="mb-4 rounded-md border border-slate-300 px-3 py-2"
      />

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">Tên</th>
              <th className="px-3 py-2 text-left">Địa điểm</th>
              <th className="px-3 py-2 text-left">Bắt đầu</th>
              <th className="px-3 py-2 text-left">Kết thúc</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(query.data?.data || []).map((activity: Activity) => (
              <tr key={activity.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{activity.name}</td>
                <td className="px-3 py-2">{activity.location || "--"}</td>
                <td className="px-3 py-2">
                  {dayjs(activity.startDate).format("DD/MM/YYYY HH:mm")}
                </td>
                <td className="px-3 py-2">
                  {activity.endDate
                    ? dayjs(activity.endDate).format("DD/MM/YYYY HH:mm")
                    : "--"}
                </td>
                <td className="px-3 py-2">
                  <Link
                    to={`/dashboard/activities/${activity.id}/edit`}
                    className="mr-3 text-blue-600"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => remove.mutate(activity.id)}
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
