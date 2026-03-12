import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore, type AuthState } from "@/stores/auth.store";

const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const schema = z
  .object({
    email: z.email("Email không hợp lệ"),
    firstName: z.string().min(1, "Nhập tên"),
    lastName: z.string().min(1, "Nhập họ"),
    password: z.string().regex(passwordRules, "Mật khẩu chưa đủ mạnh"),
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
  const registerAccount = useAuthStore((s: AuthState) => s.register);
  const loading = useAuthStore((s: AuthState) => s.loading);

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

  const password = watch("password", "");
  const strength = [/.{8,}/, /[A-Z]/, /[a-z]/, /\d/, /[@$!%*?&]/].filter((r) =>
    r.test(password),
  ).length;

  const onSubmit = async (values: FormData) => {
    try {
      await registerAccount(values);
      toast.success("Đăng ký thành công");
      navigate("/dashboard");
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 409) toast.error("Email đã được sử dụng");
      else if (status === 429)
        toast.error("Quá nhiều yêu cầu. Vui lòng thử lại sau");
      else toast.error("Đăng ký thất bại");
    }
  };

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-5 text-2xl font-bold">Đăng ký</h1>
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
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

        <input
          type="password"
          placeholder="Mật khẩu"
          {...register("password")}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        <div className="h-2 w-full rounded bg-slate-200">
          <div
            className={`h-2 rounded ${strength >= 4 ? "bg-emerald-500" : strength >= 2 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${(strength / 5) * 100}%` }}
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
