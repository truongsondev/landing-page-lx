import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 text-center">
      <h1 className="text-2xl font-bold">404 - Không tìm thấy trang</h1>
      <Link to="/" className="mt-4 inline-block text-blue-600">
        Quay lại trang chủ
      </Link>
    </div>
  );
}
