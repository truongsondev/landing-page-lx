import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { CalendarClock, ImageIcon, MapPin } from "lucide-react";
import { activitiesService } from "@/services/activities.service";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActivityCalendar } from "@/components/common/ActivityCalendar";
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
  const [calendarMonth, setCalendarMonth] = useState(dayjs());

  const query = useQuery({
    queryKey: ["activities", page, search],
    queryFn: async () => {
      const apiData = await activitiesService.getAll({ page, limit: 9, search });
      
      // Mock activities for testing
      const mockActivities: any[] = [
        {
          id: "mock-1",
          name: "Bóng đá",
          location: "Sân vận động",
          startDate: dayjs().date(21).format("YYYY-MM-DD HH:mm:ss"),
          endDate: dayjs().date(21).add(2, "hour").format("YYYY-MM-DD HH:mm:ss"),
          isRequired: true,
        },
        {
          id: "mock-2",
          name: "Bóng chuyền",
          location: "Nhà thi đấu",
          startDate: dayjs().date(21).format("YYYY-MM-DD HH:mm:ss"),
          endDate: dayjs().date(21).add(2, "hour").format("YYYY-MM-DD HH:mm:ss"),
          isRequired: false,
        },
        {
          id: "mock-3",
          name: "Marathon",
          location: "Công viên",
          startDate: dayjs().date(23).format("YYYY-MM-DD HH:mm:ss"),
          endDate: dayjs().date(23).add(3, "hour").format("YYYY-MM-DD HH:mm:ss"),
          isRequired: true,
        },
        {
          id: "mock-4",
          name: "Yoga",
          location: "Studio yoga",
          startDate: dayjs().date(25).format("YYYY-MM-DD HH:mm:ss"),
          endDate: dayjs().date(25).add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
          isRequired: false,
        },
        {
          id: "mock-5",
          name: "Bơi lội",
          location: "Hồ bơi",
          startDate: dayjs().date(27).format("YYYY-MM-DD HH:mm:ss"),
          endDate: dayjs().date(27).add(2, "hour").format("YYYY-MM-DD HH:mm:ss"),
          isRequired: true,
        },
        {
          id: "mock-6",
          name: "Cầu lông",
          location: "Sân cầu lông",
          startDate: dayjs().date(28).format("YYYY-MM-DD HH:mm:ss"),
          endDate: dayjs().date(28).add(1.5, "hour").format("YYYY-MM-DD HH:mm:ss"),
          isRequired: false,
        },
      ];
      
      return {
        ...apiData,
        data: [...(apiData?.data || []), ...mockActivities],
      };
    },
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
      <h1 className="mb-4 text-2xl font-bold">Lịch hoạt động</h1>
      
      {/* Calendar */}
      <div className="mb-8">
        <ActivityCalendar 
          activities={query.data?.data || []} 
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
        />
      </div>

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
          const isRequired = Boolean(activity.isRequired);
          return (
            <Link
              key={activity.id}
              to={`/activities/${activity.id}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100">
                {activity.thumbnail ? (
                  <img
                    src={activity.thumbnail}
                    alt={activity.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-500">
                    <ImageIcon size={28} />
                  </div>
                )}
                <div
                  className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${
                    isRequired
                      ? "border-red-200 bg-red-50/95 text-red-700"
                      : "border-amber-200 bg-amber-50/95 text-amber-700"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isRequired ? "bg-red-500" : "bg-amber-500"
                    }`}
                  />
                  <span>{isRequired ? "Bắt buộc" : "Không bắt buộc"}</span>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <h3 className="line-clamp-2 text-base font-bold text-slate-800">{activity.name}</h3>

                <div className="space-y-1.5 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <CalendarClock size={14} className="shrink-0 text-slate-500" />
                    <span>{dayjs(activity.startDate).format("DD/MM/YYYY HH:mm")}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={14} className="shrink-0 text-slate-500" />
                    <span className="truncate">{activity.location || "Chưa cập nhật địa điểm"}</span>
                  </p>
                </div>

                <div className="pt-1">
                  <StatusBadge status={status} />
                </div>
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
