import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore, type AuthState } from "@/stores/auth.store";

const schema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
  rememberMe: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s: AuthState) => s.login);
  const loading = useAuthStore((s: AuthState) => s.loading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: FormData) => {
    try {
      await login(values);
      toast.success("Đăng nhập thành công");
      const redirect =
        (location.state as { from?: string } | null)?.from || "/dashboard";
      navigate(redirect);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) toast.error("Email hoặc mật khẩu không đúng");
      else if (status === 429)
        toast.error("Quá nhiều lần đăng nhập. Vui lòng thử lại sau 15 phút");
      else toast.error("Không thể kết nối đến server");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-5 text-2xl font-bold">Đăng nhập</h1>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            {...register("email")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
          <input
            type="password"
            {...register("password")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" {...register("rememberMe")} /> Ghi nhớ đăng
          nhập
        </label>
        <button
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
        <Link className="text-blue-600" to="/register">
          Chưa có tài khoản? Đăng ký ngay
        </Link>
        <Link className="text-blue-600" to="/">
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
