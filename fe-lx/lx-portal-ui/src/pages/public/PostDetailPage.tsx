import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { postsService } from "@/services/posts.service";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";

export function PostDetailPage() {
  const { slug = "" } = useParams();

  const detail = useQuery({
    queryKey: ["post-detail", slug],
    queryFn: () => postsService.getBySlug(slug),
    enabled: Boolean(slug),
  });

  const related = useQuery({
    queryKey: ["related-posts", detail.data?.category?.id],
    queryFn: () =>
      postsService.getAll({ categoryId: detail.data?.category?.id, limit: 4 }),
    enabled: Boolean(detail.data?.category?.id),
  });

  if (detail.isLoading) return <Loading />;
  if (detail.isError || !detail.data) return <ErrorState />;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <article className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="mb-2 text-sm text-slate-500">
          {detail.data.category?.name}
        </p>
        <h1 className="mb-3 text-3xl font-bold">{detail.data.title}</h1>
        <p className="mb-4 text-sm text-slate-500">
          {dayjs(detail.data.publishedAt || detail.data.createdAt).format(
            "DD/MM/YYYY HH:mm",
          )}
        </p>
        {detail.data.thumbnail && (
          <img
            className="mb-4 w-full rounded-lg"
            src={detail.data.thumbnail}
            alt={detail.data.title}
          />
        )}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: detail.data.content || "" }}
        />
        <Link to="/posts" className="mt-6 inline-block text-blue-600">
          ← Quay lại danh sách
        </Link>
      </article>
      <aside className="space-y-3">
        <h3 className="text-lg font-semibold">Bài viết liên quan</h3>
        {related.data?.data?.map((post) => (
          <Link
            key={post.id}
            to={`/posts/${post.slug}`}
            className="block rounded-lg border border-slate-200 bg-white p-3"
          >
            <p className="line-clamp-2 text-sm font-medium">{post.title}</p>
          </Link>
        ))}
      </aside>
    </div>
  );
}
