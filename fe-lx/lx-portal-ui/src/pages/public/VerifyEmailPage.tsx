import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authService } from "@/services/auth.service";

type VerifyStatus = "loading" | "success" | "error";

const defaultSuccessMessage =
  "Xác thực email thành công. Vui lòng chờ admin duyệt tài khoản trước khi đăng nhập.";

const pendingApprovalNotice =
  "Vui lòng chờ admin duyệt tài khoản trước khi đăng nhập.";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("Đang xác thực email của bạn...");
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Link xác thực không hợp lệ hoặc đã hết hạn.");
      return;
    }

    const runVerify = async () => {
      try {
        const response = await authService.verifyEmail(token);
        setStatus("success");
        const successMessage = response.message?.trim();
        if (!successMessage) {
          setMessage(defaultSuccessMessage);
          return;
        }
        setMessage(
          successMessage.includes("admin duyệt")
            ? successMessage
            : `${successMessage} ${pendingApprovalNotice}`,
        );
      } catch (error: unknown) {
        const statusCode = (error as { response?: { status?: number } })
          ?.response?.status;
        setStatus("error");
        if (statusCode === 400) {
          setMessage("Link xác thực không hợp lệ hoặc đã hết hạn.");
          return;
        }
        setMessage("Không thể xác thực email. Vui lòng thử lại sau.");
      }
    };

    void runVerify();
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Xác thực email</h1>
      <p
        className={`mt-3 text-sm ${
          status === "success"
            ? "text-emerald-700"
            : status === "error"
              ? "text-red-600"
              : "text-slate-600"
        }`}
      >
        {message}
      </p>

      <div className="mt-5 flex gap-3">
        {status === "success" ? (
          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
          >
            Đi đến đăng nhập
          </Link>
        ) : (
          <Link
            to="/register"
            className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white"
          >
            Quay lại đăng ký
          </Link>
        )}
        <a
          href="http://localhost:5173/"
          className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
        >
          Về trang chủ
        </a>
      </div>
    </div>
  );
}
