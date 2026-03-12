import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
      <h1 className="text-2xl font-bold text-amber-700">
        Không có quyền truy cập
      </h1>
      <p className="mt-2 text-slate-700">Bạn không có quyền vào trang này.</p>
      <Link
        to="/"
        className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-white"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
