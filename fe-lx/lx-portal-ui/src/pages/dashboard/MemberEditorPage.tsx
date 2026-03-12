import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { membersService } from "@/services/members.service";

interface FormData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
  phone: string;
  address: string;
  major: string;
  className: string;
  position: string;
  status: "ACTIVE" | "INACTIVE" | "ALUMNI";
  bio: string;
}

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
      email: detail.data.email || "",
      firstName: detail.data.firstName || "",
      lastName: detail.data.lastName || "",
      studentId: detail.data.studentId || "",
      phone: "",
      address: "",
      major: "",
      className: "",
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
    mutationFn: (payload: FormData) => membersService.update(id || "", payload),
    onSuccess: () => {
      toast.success("Cập nhật thành viên thành công");
      navigate("/dashboard/members");
    },
  });

  const onSubmit = async (values: FormData) => {
    if (isEdit) {
      await update.mutateAsync(values);
      return;
    }
    await create.mutateAsync(values);
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
          {...register("userId", { required: true })}
          placeholder="User ID"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          {...register("email")}
          placeholder="Email"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          {...register("firstName")}
          placeholder="Tên"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          {...register("lastName")}
          placeholder="Họ"
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          {...register("studentId")}
          placeholder="Mã sinh viên"
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
