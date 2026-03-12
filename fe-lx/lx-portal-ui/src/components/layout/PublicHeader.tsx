import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

const menus = [
  { to: "/", label: "Trang chủ" },
  { to: "/posts", label: "Thông báo" },
  { to: "/members", label: "Thành viên" },
  { to: "/activities", label: "Hoạt động" },
];

export function PublicHeader() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/images/brand/logo-da-minh-thu-duc-2.svg"
            alt="Logo Đa Minh Thủ Đức 2"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="h-10 w-10 rounded-md border border-slate-200 object-cover"
          />
          <div>
            <p className="text-sm font-semibold leading-4 text-blue-700">
              Đa Minh Thủ Đức 2
            </p>
            <p className="text-xs text-slate-500">
              Sinh viên Nhịp Bước Đa Minh
            </p>
          </div>
        </Link>
        <nav className="hidden gap-5 md:flex">
          {menus.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? "text-blue-600" : "text-slate-700 hover:text-blue-600"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex gap-2">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
