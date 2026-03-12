import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { activitiesService } from "@/services/activities.service";
import { useAuthStore, type AuthState } from "@/stores/auth.store";

interface FormData {
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  organizerId: string;
  thumbnail: string;
  imagesText: string;
}

const DEFAULT_ACTIVITY_IMAGES = [
  "/images/activities/da-minh-td2-1.svg",
  "/images/activities/da-minh-td2-2.svg",
  "/images/activities/da-minh-td2-3.svg",
];

const parseImages = (imagesText: string): string[] =>
  imagesText
    .split(/\r?\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);

export function ActivityEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const user = useAuthStore((s: AuthState) => s.user);

  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues: {
      organizerId: user?.id || "",
      startDate: "",
      endDate: "",
      name: "",
      description: "",
      location: "",
      thumbnail: "",
      imagesText: DEFAULT_ACTIVITY_IMAGES.join("\n"),
    },
  });

  const detail = useQuery({
    queryKey: ["activity-edit", id],
    queryFn: () => activitiesService.getById(id || ""),
    enabled: isEdit,
  });

  useEffect(() => {
    if (!detail.data) return;
    reset({
      name: detail.data.name,
      description: detail.data.description || "",
      location: detail.data.location || "",
      startDate: detail.data.startDate,
      endDate: detail.data.endDate || "",
      organizerId: detail.data.organizerId || user?.id || "",
      thumbnail: detail.data.thumbnail || "",
      imagesText: (detail.data.images || []).join("\n"),
    });
  }, [detail.data, reset, user?.id]);

  const create = useMutation({
    mutationFn: activitiesService.create,
    onSuccess: () => {
      toast.success("Tạo hoạt động thành công");
      navigate("/dashboard/activities");
    },
  });

  const update = useMutation({
    mutationFn: (payload: FormData) =>
      activitiesService.update(id || "", payload),
    onSuccess: () => {
      toast.success("Cập nhật hoạt động thành công");
      navigate("/dashboard/activities");
    },
  });

  const onSubmit = async (values: FormData) => {
    if (
      values.endDate &&
      new Date(values.endDate) <= new Date(values.startDate)
    ) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    const payload = {
      ...values,
      images: parseImages(values.imagesText),
    };

    if (isEdit) {
      await update.mutateAsync(payload);
      return;
    }
    await create.mutateAsync(payload);
  };

  const imagePreview = parseImages(watch("imagesText") || "");

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">
        {isEdit ? "Sửa hoạt động" : "Tạo hoạt động"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
        <input
          {...register("name", { required: true })}
          placeholder="Tên hoạt động"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <textarea
          {...register("description")}
          rows={6}
          placeholder="Mô tả"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          {...register("location")}
          placeholder="Địa điểm"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          type="datetime-local"
          {...register("startDate", { required: true })}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          type="datetime-local"
          {...register("endDate")}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          {...register("thumbnail")}
          placeholder="Thumbnail URL"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Không gian thêm hình hoạt động
          </p>
          <textarea
            {...register("imagesText")}
            rows={4}
            placeholder="Mỗi dòng 1 URL ảnh hoặc phân tách bằng dấu phẩy"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
          />
          <p className="mt-2 text-xs text-slate-500">
            Gợi ý: dùng ảnh ngang chất lượng tốt để hiển thị đẹp ở trang chi
            tiết.
          </p>
          {imagePreview.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
              {imagePreview.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="Preview"
                  className="h-20 w-full rounded-md object-cover"
                />
              ))}
            </div>
          )}
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white">
          Lưu
        </button>
      </form>
    </div>
  );
}
