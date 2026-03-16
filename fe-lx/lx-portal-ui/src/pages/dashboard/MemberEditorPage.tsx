import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  membersService,
  type UpsertMemberPayload,
} from "@/services/members.service";

interface FormData {
  userId: string;
  name: string;
  avatar: string;
  saintName: string;
  dateOfBirth: string;
  school: string;
  studentId: string;
  phoneNumber: string;
  address: string;
  position: string;
  status: "ACTIVE" | "INACTIVE" | "ALUMNI";
  bio: string;
}

const trimOrUndefined = (value?: string) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const toPayload = (values: FormData, isEdit: boolean): UpsertMemberPayload => ({
  userId: isEdit ? trimOrUndefined(values.userId) : values.userId.trim(),
  name: trimOrUndefined(values.name),
  avatar: trimOrUndefined(values.avatar),
  saintName: trimOrUndefined(values.saintName),
  bio: trimOrUndefined(values.bio),
  dateOfBirth: trimOrUndefined(values.dateOfBirth),
  school: trimOrUndefined(values.school),
  studentId: trimOrUndefined(values.studentId),
  phoneNumber: trimOrUndefined(values.phoneNumber),
  address: trimOrUndefined(values.address),
  position: trimOrUndefined(values.position),
  status: values.status,
});

export function MemberEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      status: "ACTIVE",
    },
  });

  const detail = useQuery({
    queryKey: ["member-edit", id],
    queryFn: () => membersService.getById(id || ""),
    enabled: isEdit,
  });

  useEffect(() => {
    if (!detail.data) return;
    reset({
      userId: detail.data.userId || "",
      name: detail.data.name || detail.data.fullName || "",
      avatar: detail.data.avatar || "",
      saintName: detail.data.saintName || "",
      dateOfBirth: detail.data.dateOfBirth?.slice(0, 10) || "",
      school: detail.data.school || "",
      studentId: detail.data.studentId || "",
      phoneNumber: detail.data.phoneNumber || "",
      address: detail.data.address || "",
      position: detail.data.position || "",
      status: detail.data.status || "ACTIVE",
      bio: detail.data.bio || "",
    });
  }, [detail.data, reset]);

  const create = useMutation({
    mutationFn: membersService.create,
    onSuccess: () => {
      toast.success("Tạo thành viên thành công");
      navigate("/dashboard/members");
    },
  });

  const update = useMutation({
    mutationFn: (payload: UpsertMemberPayload) =>
      membersService.update(id || "", payload),
    onSuccess: () => {
      toast.success("Cập nhật thành viên thành công");
      navigate("/dashboard/members");
    },
  });

  const onSubmit = async (values: FormData) => {
    const payload = toPayload(values, isEdit);

    if (isEdit) {
      await update.mutateAsync(payload);
      return;
    }
    await create.mutateAsync(payload);
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">
        {isEdit ? "Sửa thành viên" : "Tạo thành viên"}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-3 md:grid-cols-2"
      >
        <input
          {...register("userId", { required: !isEdit })}
          placeholder="User ID (bắt buộc khi tạo mới)"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          {...register("name")}
          placeholder="Họ và tên"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          {...register("avatar")}
          placeholder="Avatar URL"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          {...register("saintName")}
          placeholder="Tên thánh"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          type="date"
          {...register("dateOfBirth")}
          placeholder="Ngày sinh"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          {...register("school")}
          placeholder="Trường học"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          {...register("studentId")}
          placeholder="Mã sinh viên"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          {...register("phoneNumber")}
          placeholder="Số điện thoại"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          {...register("address")}
          placeholder="Địa chỉ"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          {...register("position")}
          placeholder="Chức vụ"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <select
          {...register("status")}
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ALUMNI">Alumni</option>
        </select>
        <textarea
          {...register("bio")}
          placeholder="Tiểu sử"
          rows={4}
          className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2"
        />
        <button className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white md:col-span-2">
          Lưu
        </button>
      </form>
    </div>
  );
}
