import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitErrorHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

const passwordRules = /^.{6,20}$/;

const schema = z
  .object({
    email: z.email("Email không hợp lệ").transform((v) => v.toLowerCase()),
    firstName: z
      .string()
      .trim()
      .min(1, "Nhập tên")
      .max(100, "Tên không được quá 100 ký tự"),
    lastName: z
      .string()
      .trim()
      .min(1, "Nhập họ")
      .max(100, "Họ không được quá 100 ký tự"),
    password: z
      .string()
      .regex(passwordRules, "Mật khẩu phải từ 6 đến 20 ký tự"),
    confirmPassword: z.string().min(1, "Nhập lại mật khẩu"),
    termsAccepted: z.boolean().refine((v) => v, "Bạn cần đồng ý điều khoản"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      termsAccepted: false,
    },
  });

  const passwordLength = watch("password", "").length;
  const meterPercent = Math.min((passwordLength / 20) * 100, 100);

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      const response = await authService.register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      toast.success(
        response.message ||
          "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
      );
      navigate("/");
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 409) toast.error("Email đã được sử dụng");
      else if (status === 429)
        toast.error("Quá nhiều lần đăng ký. Vui lòng thử lại sau 15 phút");
      else if (status === 400) toast.error("Thông tin đăng ký chưa hợp lệ");
      else toast.error("Đăng ký thất bại. Vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const onInvalid: SubmitErrorHandler<FormData> = () => {
    toast.error("Vui lòng kiểm tra lại thông tin đăng ký");
  };

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-5 text-2xl font-bold">Đăng ký</h1>
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <input
          placeholder="Email"
          {...register("email")}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Họ"
            {...register("lastName")}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            placeholder="Tên"
            {...register("firstName")}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        {(errors.lastName || errors.firstName) && (
          <p className="text-sm text-red-600">
            {errors.lastName?.message || errors.firstName?.message}
          </p>
        )}

        <input
          type="password"
          placeholder="Mật khẩu"
          {...register("password")}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        <div className="h-2 w-full rounded bg-slate-200">
          <div
            className={`h-2 rounded ${passwordLength >= 12 ? "bg-emerald-500" : passwordLength >= 6 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${meterPercent}%` }}
          />
        </div>
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          {...register("confirmPassword")}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        {(errors.password || errors.confirmPassword) && (
          <p className="text-sm text-red-600">
            {errors.password?.message || errors.confirmPassword?.message}
          </p>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("termsAccepted")} /> Tôi đồng ý
          điều khoản sử dụng
        </label>
        {errors.termsAccepted && (
          <p className="text-sm text-red-600">{errors.termsAccepted.message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>
      <Link to="/login" className="mt-4 inline-block text-sm text-blue-600">
        Đã có tài khoản? Đăng nhập
      </Link>
    </div>
  );
}
