export function EmailVerifyFailedPage() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-red-700">
        Xac thuc email that bai
      </h1>
      <p className="mt-3 text-sm text-red-700">
        Link xac thuc khong hop le hoac da het han. Vui long thu dang ky lai.
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
