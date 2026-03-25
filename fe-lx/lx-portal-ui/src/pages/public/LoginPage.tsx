import { z } from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore, type AuthState } from "@/stores/auth.store";

function getServerMessage(error: unknown): string | null {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (!data || typeof data !== "object") return null;

  const message = (data as { message?: unknown }).message;
  if (typeof message === "string" && message.trim()) return message;

  if (Array.isArray(message)) {
    const firstText = message.find(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
    return firstText || null;
  }

  return null;
}

const schema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
  rememberMe: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s: AuthState) => s.isAuthenticated);
  const login = useAuthStore((s: AuthState) => s.login);
  const loading = useAuthStore((s: AuthState) => s.loading);

  useEffect(() => {
    if (!isAuthenticated) return;
    navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

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
        (location.state as { from?: string } | null)?.from || "/";
      navigate(redirect);
    } catch (error: unknown) {
      const serverMessage = getServerMessage(error);
      if (serverMessage) {
        toast.error(serverMessage);
        return;
      }

      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) toast.error("Email hoặc mật khẩu không đúng");
      else if (status === 429)
        toast.error("Quá nhiều lần đăng nhập. Vui lòng thử lại sau 15 phút");
      else toast.error("Không thể kết nối đến server");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.32),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(37,99,235,0.28),transparent_40%),radial-gradient(circle_at_50%_85%,rgba(6,182,212,0.24),transparent_45%)]" />
      <div className="pointer-events-none absolute -left-16 top-1/3 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/35 bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
        <h1 className="mb-1 text-3xl font-black text-slate-900">Đăng nhập</h1>
        <p className="mb-6 text-sm text-slate-600">
          Chào mừng quay lại, vui lòng đăng nhập để tiếp tục.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
            <input
              {...register("email")}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Mật khẩu</label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register("rememberMe")} className="accent-cyan-600" /> Ghi nhớ đăng nhập
          </label>
          <button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-5 flex flex-col gap-2 text-sm text-slate-600">
          <Link className="font-medium text-cyan-700 hover:text-cyan-800" to="/register">
            Chưa có tài khoản? Đăng ký ngay
          </Link>
          <Link className="font-medium text-slate-700 hover:text-slate-900" to="/">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
