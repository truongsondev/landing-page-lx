import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { membersService } from "@/services/members.service";
import { activitiesService } from "@/services/activities.service";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import type { Activity } from "@/types/models";

export function MemberDetailPage() {
  const { id = "" } = useParams();

  const detail = useQuery({
    queryKey: ["member-detail", id],
    queryFn: () => membersService.getById(id),
    enabled: Boolean(id),
  });

  const activities = useQuery({
    queryKey: ["member-activities", detail.data?.userId],
    queryFn: () => activitiesService.getAll({}),
    enabled: Boolean(detail.data?.userId),
  });

  if (detail.isLoading) return <Loading />;
  if (detail.isError || !detail.data) return <ErrorState />;

  const name =
    detail.data.fullName ||
    `${detail.data.lastName || ""} ${detail.data.firstName || ""}`.trim();

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <img
          src={detail.data.avatar || "https://placehold.co/160x160?text=Avatar"}
          alt={name}
          className="mb-4 h-28 w-28 rounded-full object-cover"
        />
        <h1 className="text-3xl font-bold">{name}</h1>
        <p className="mt-2 text-slate-600">
          {detail.data.position || "Member"}
        </p>
        <p className="text-slate-600">
          Mã sinh viên: {detail.data.studentId || "--"}
        </p>
        <p className="text-slate-600">
          Ngày tham gia: {dayjs(detail.data.joinDate).format("DD/MM/YYYY")}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-2 text-xl font-semibold">Tiểu sử</h2>
        <p className="text-slate-700">{detail.data.bio || "Chưa cập nhật."}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-2 text-xl font-semibold">Hoạt động tham gia</h2>
        <div className="space-y-2">
          {(activities.data?.data || []).map((item: Activity) => (
            <p key={item.id} className="text-sm text-slate-700">
              • {item.name}
            </p>
          ))}
        </div>
      </div>

      <Link to="/members" className="inline-block text-blue-600">
        ← Quay lại thành viên
      </Link>
    </div>
  );
}
