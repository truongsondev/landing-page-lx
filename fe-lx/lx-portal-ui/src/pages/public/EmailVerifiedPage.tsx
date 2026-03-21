export function EmailVerifiedPage() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-emerald-800">
        Xac thuc email thanh cong
      </h1>
      <p className="mt-3 text-sm text-emerald-900">
        Vui long chờ admin duyet tai khoan truoc khi dang nhap.
      </p>

      <div className="mt-5">
        <a
          href="http://localhost:5173/"
          className="inline-block rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white"
        >
          Ve trang chu
        </a>
      </div>
    </div>
  );
}
