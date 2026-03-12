import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { postsService } from "@/services/posts.service";
import { membersService } from "@/services/members.service";
import { activitiesService } from "@/services/activities.service";
import { useAuthStore, type AuthState } from "@/stores/auth.store";
import { Loading } from "@/components/common/Loading";

export function DashboardPage() {
  const user = useAuthStore((s: AuthState) => s.user);

  const draftPosts = useQuery({
    queryKey: ["dashboard", "posts"],
    queryFn: () => postsService.getAll({ limit: 5, status: "DRAFT" }),
    enabled: user?.role === "ADMIN" || user?.role === "MODERATOR",
  });

  const members = useQuery({
    queryKey: ["dashboard", "members"],
    queryFn: () => membersService.getAll({ limit: 5 }),
    enabled: user?.role === "ADMIN",
  });

  const activities = useQuery({
    queryKey: ["dashboard", "activities"],
    queryFn: () => activitiesService.getAll({ limit: 3 }),
  });

  if (activities.isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Bài viết nháp</p>
          <p className="text-2xl font-bold">
            {draftPosts.data?.data?.length || 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Thành viên</p>
          <p className="text-2xl font-bold">
            {members.data?.data?.length || 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Hoạt động sắp tới</p>
          <p className="text-2xl font-bold">
            {activities.data?.data?.length || 0}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/dashboard/posts/create"
          className="rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white"
        >
          Tạo bài viết mới
        </Link>
        <Link
          to="/dashboard/activities/create"
          className="rounded-lg bg-indigo-600 px-4 py-3 text-center font-semibold text-white"
        >
          Tạo hoạt động mới
        </Link>
        <Link
          to="/dashboard/members/create"
          className="rounded-lg bg-slate-900 px-4 py-3 text-center font-semibold text-white"
        >
          Thêm thành viên
        </Link>
      </div>
    </div>
  );
}
