import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { activitiesService } from "@/services/activities.service";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";

const DEFAULT_ACTIVITY_IMAGES = [
  "/images/activities/da-minh-td2-1.svg",
  "/images/activities/da-minh-td2-2.svg",
  "/images/activities/da-minh-td2-3.svg",
];

export function ActivityDetailPage() {
  const { id = "" } = useParams();

  const query = useQuery({
    queryKey: ["activity-detail", id],
    queryFn: () => activitiesService.getById(id),
    enabled: Boolean(id),
  });

  if (query.isLoading) return <Loading />;
  if (query.isError || !query.data) return <ErrorState />;

  const item = query.data;
  const gallery =
    item.images && item.images.length > 0
      ? item.images
      : DEFAULT_ACTIVITY_IMAGES;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {item.thumbnail && (
          <img
            src={item.thumbnail}
            alt={item.name}
            className="h-64 w-full object-cover"
          />
        )}
        <div className="p-6">
          <h1 className="text-3xl font-bold">{item.name}</h1>
          <p className="mt-2 text-slate-600">{item.location}</p>
          <p className="text-slate-600">
            {dayjs(item.startDate).format("DD/MM/YYYY HH:mm")} -{" "}
            {item.endDate
              ? dayjs(item.endDate).format("DD/MM/YYYY HH:mm")
              : "N/A"}
          </p>
          <p className="mt-3 text-slate-700">{item.description}</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-xl font-bold">Kho ảnh hoạt động</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((imageUrl) => (
            <img
              key={imageUrl}
              src={imageUrl}
              alt={item.name}
              onError={(e) => {
                e.currentTarget.src = DEFAULT_ACTIVITY_IMAGES[0];
              }}
              className="h-44 w-full rounded-lg object-cover"
            />
          ))}
        </div>
      </section>

      <Link to="/activities" className="inline-block text-blue-600">
        ← Quay lại hoạt động
      </Link>
    </div>
  );
}
