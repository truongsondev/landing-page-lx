import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { postsService } from "@/services/posts.service";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import type { Post } from "@/types/models";

export function PostsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["posts", page, search],
    queryFn: () => postsService.getAll({ page, limit: 12, search }),
  });

  if (query.isLoading) return <Loading />;
  if (query.isError) return <ErrorState onRetry={query.refetch} />;

  const list = query.data?.data || [];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Thông báo / Bài viết</h1>
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tiêu đề"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 md:w-96"
        />
      </div>

      {list.length === 0 ? (
        <EmptyState title="Chưa có bài viết nào" />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {list.map((post: Post) => (
            <Link
              key={post.id}
              to={`/posts/${post.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <h3 className="line-clamp-2 font-semibold">{post.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                {post.excerpt}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                {dayjs(post.publishedAt || post.createdAt).format("DD/MM/YYYY")}
              </p>
            </Link>
          ))}
        </div>
      )}

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
