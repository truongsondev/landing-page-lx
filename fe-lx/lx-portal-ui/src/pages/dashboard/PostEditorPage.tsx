import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { postsService, type UpsertPostPayload } from "@/services/posts.service";

interface FormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  categoryId: string;
  location: string;
  eventTime: string;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "ARCHIVED";
  isPinned: boolean;
  publishAt: string;
  thumbnail: FileList;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const toLocalDateTimeValue = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const timezoneOffsetInMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetInMs)
    .toISOString()
    .slice(0, 16);
};

const trimOrUndefined = (value?: string) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const toPayload = (values: FormData): UpsertPostPayload => ({
  title: values.title.trim(),
  slug: values.slug.trim(),
  content: values.content.trim(),
  excerpt: trimOrUndefined(values.excerpt),
  categoryId: values.categoryId.trim(),
  location: values.location.trim(),
  eventTime: new Date(values.eventTime).toISOString(),
  status: values.status,
  isPinned: Boolean(values.isPinned),
  publishAt: values.publishAt
    ? new Date(values.publishAt).toISOString()
    : undefined,
  thumbnail: values.thumbnail?.[0] || null,
});

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
      location: "",
      eventTime: "",
      status: "DRAFT",
      isPinned: false,
      publishAt: "",
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
        location: detail.data.location || "",
        eventTime: toLocalDateTimeValue(detail.data.eventTime),
        status: detail.data.status,
        isPinned: Boolean(detail.data.isPinned),
        publishAt: toLocalDateTimeValue(
          detail.data.publishAt || detail.data.publishedAt,
        ),
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
      toast.success("Tạo thông báo thành công");
      navigate("/dashboard/posts");
    },
  });

  const update = useMutation({
    mutationFn: (payload: UpsertPostPayload) =>
      postsService.update(id || "", payload),
    onSuccess: () => {
      toast.success("Cập nhật thông báo thành công");
      navigate("/dashboard/posts");
    },
  });

  const onSubmit = async (data: FormData) => {
    const payload = toPayload(data);

    if (isEdit) {
      await update.mutateAsync(payload);
      return;
    }
    await create.mutateAsync(payload);
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">
        {isEdit ? "Sửa thông báo" : "Tạo thông báo"}
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
          <input
            {...register("location", { required: true })}
            placeholder="Địa điểm"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            type="datetime-local"
            {...register("eventTime", { required: true })}
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
          <input
            type="datetime-local"
            {...register("publishAt")}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            type="file"
            accept="image/*"
            {...register("thumbnail")}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isPinned")} /> Ghim thông báo
          </label>
          <button className="w-full rounded-md bg-blue-600 px-3 py-2 font-semibold text-white">
            {isEdit ? "Cập nhật" : "Lưu thông báo"}
          </button>
        </aside>
      </form>
    </div>
  );
}
