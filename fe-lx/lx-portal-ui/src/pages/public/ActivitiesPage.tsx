import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { activitiesService } from "@/services/activities.service";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Activity } from "@/types/models";

type Tab = "ALL" | "UPCOMING" | "PAST";

const getStatus = (startDate: string, endDate?: string | null) => {
  const now = dayjs();
  const start = dayjs(startDate);
  const end = endDate ? dayjs(endDate) : start;
  if (now.isBefore(start)) return "UPCOMING";
  if (now.isAfter(end)) return "PAST";
  return "ONGOING";
};

export function ActivitiesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("ALL");

  const query = useQuery({
    queryKey: ["activities", page, search],
    queryFn: () => activitiesService.getAll({ page, limit: 9, search }),
  });

  const list = useMemo(() => {
    const items = query.data?.data || [];
    return items.filter((item: Activity) => {
      if (tab === "ALL") return true;
      return getStatus(item.startDate, item.endDate) === tab;
    });
  }, [query.data, tab]);

  if (query.isLoading) return <Loading />;
  if (query.isError) return <ErrorState onRetry={query.refetch} />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Hoạt động thể thao</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["ALL", "UPCOMING", "PAST"] as Tab[]).map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`rounded-md px-3 py-1 text-sm ${tab === value ? "bg-blue-600 text-white" : "bg-white border border-slate-300"}`}
          >
            {value}
          </button>
        ))}
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm theo tên hoạt động"
        className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 md:w-96"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {list.map((activity: Activity) => {
          const status = getStatus(activity.startDate, activity.endDate);
          return (
            <Link
              key={activity.id}
              to={`/activities/${activity.id}`}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <h3 className="font-semibold">{activity.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{activity.location}</p>
              <p className="text-sm text-slate-600">
                {dayjs(activity.startDate).format("DD/MM/YYYY HH:mm")}
              </p>
              <div className="mt-3">
                <StatusBadge status={status} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-2">
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
