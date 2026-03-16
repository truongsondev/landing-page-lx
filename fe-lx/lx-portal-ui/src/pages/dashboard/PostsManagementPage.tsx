import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "sonner";
import { postsService } from "@/services/posts.service";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Post } from "@/types/models";

export function PostsManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["dashboard-posts", page, search, status],
    queryFn: () =>
      postsService.getAll({
        page,
        limit: 10,
        search,
        status: status === "all" ? undefined : status,
      }),
  });

  const remove = useMutation({
    mutationFn: postsService.remove,
    onSuccess: () => {
      toast.success("Đã xóa thông báo");
      qc.invalidateQueries({ queryKey: ["dashboard-posts"] });
    },
  });

  const publish = useMutation({
    mutationFn: postsService.publish,
    onSuccess: () => {
      toast.success("Đã publish thông báo");
      qc.invalidateQueries({ queryKey: ["dashboard-posts"] });
    },
  });

  const unpublish = useMutation({
    mutationFn: postsService.unpublish,
    onSuccess: () => {
      toast.success("Đã unpublish thông báo");
      qc.invalidateQueries({ queryKey: ["dashboard-posts"] });
    },
  });

  if (query.isLoading) return <Loading />;
  if (query.isError) return <ErrorState onRetry={query.refetch} />;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Quản lý thông báo</h1>
        <Link
          to="/dashboard/posts/create"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Tạo thông báo mới
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tiêu đề"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="all">Tất cả</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">Tiêu đề</th>
              <th className="px-3 py-2 text-left">Địa điểm</th>
              <th className="px-3 py-2 text-left">Thời gian</th>
              <th className="px-3 py-2 text-left">Người tạo</th>
              <th className="px-3 py-2 text-left">Ngày tạo</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(query.data?.data || []).map((post: Post) => (
              <tr key={post.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <Link
                    className="text-blue-600"
                    to={`/dashboard/posts/${post.id}/edit`}
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-3 py-2">{post.location || "--"}</td>
                <td className="px-3 py-2">
                  {post.eventTime
                    ? dayjs(post.eventTime).format("DD/MM/YYYY HH:mm")
                    : "--"}
                </td>
                <td className="px-3 py-2">{post.author?.email || "--"}</td>
                <td className="px-3 py-2">
                  {post.createdAt
                    ? dayjs(post.createdAt).format("DD/MM/YYYY")
                    : "--"}
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={post.status} />
                </td>
                <td className="px-3 py-2">
                  {post.status === "PUBLISHED" ? (
                    <button
                      onClick={() => unpublish.mutate(post.id)}
                      className="mr-3 text-amber-600"
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={() => publish.mutate(post.id)}
                      className="mr-3 text-emerald-600"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => remove.mutate(post.id)}
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
