import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { postsService } from "@/services/posts.service";

interface FormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  categoryId: string;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "ARCHIVED";
  isPinned: boolean;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export function PostEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormData>({
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      categoryId: "",
      status: "DRAFT",
      isPinned: false,
    },
  });

  const detail = useQuery({
    queryKey: ["post-edit", id],
    queryFn: () => postsService.getById(id || ""),
    enabled: isEdit,
  });

  useEffect(() => {
    if (detail.data && isEdit) {
      reset({
        title: detail.data.title,
        slug: detail.data.slug,
        content: detail.data.content || "",
        excerpt: detail.data.excerpt || "",
        categoryId: detail.data.category?.id || "",
        status: detail.data.status,
        isPinned: Boolean(detail.data.isPinned),
      });
    }
  }, [detail.data, isEdit, reset]);

  useEffect(() => {
    const title = watch("title");
    const slug = watch("slug");
    if (!slug && title) setValue("slug", slugify(title));
  }, [watch, setValue]);

  const create = useMutation({
    mutationFn: postsService.create,
    onSuccess: () => {
      toast.success("Tạo bài viết thành công");
      navigate("/dashboard/posts");
    },
  });

  const update = useMutation({
    mutationFn: (payload: FormData) => postsService.update(id || "", payload),
    onSuccess: () => {
      toast.success("Cập nhật bài viết thành công");
      navigate("/dashboard/posts");
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isEdit) {
      await update.mutateAsync(data);
      return;
    }
    await create.mutateAsync(data);
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">
        {isEdit ? "Sửa bài viết" : "Tạo bài viết"}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-4 md:grid-cols-[1fr_320px]"
      >
        <div className="space-y-3">
          <input
            {...register("title", { required: true })}
            placeholder="Tiêu đề"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            {...register("slug", { required: true })}
            placeholder="Slug"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <textarea
            {...register("content", { required: true })}
            rows={12}
            placeholder="Nội dung"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <aside className="space-y-3 rounded-xl border border-slate-200 p-4">
          <select
            {...register("status")}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <input
            {...register("categoryId", { required: true })}
            placeholder="Category ID"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <textarea
            {...register("excerpt")}
            rows={3}
            placeholder="Excerpt"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isPinned")} /> Ghim bài viết
          </label>
          <button className="w-full rounded-md bg-blue-600 px-3 py-2 font-semibold text-white">
            {isEdit ? "Cập nhật" : "Lưu bài viết"}
          </button>
        </aside>
      </form>
    </div>
  );
}
