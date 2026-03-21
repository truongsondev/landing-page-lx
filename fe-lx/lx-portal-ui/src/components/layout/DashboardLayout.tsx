import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore, type AuthState } from "@/stores/auth.store";

const menus = [
  { to: "/dashboard", label: "Tổng quan" },
  { to: "/dashboard/posts", label: "Thông báo" },
  { to: "/dashboard/members", label: "Thành viên" },
  { to: "/dashboard/activities", label: "Hoạt động" },
  { to: "/dashboard/profile", label: "Hồ sơ" },
];

export function DashboardLayout() {
  const logout = useAuthStore((s: AuthState) => s.logout);
  const user = useAuthStore((s: AuthState) => s.user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
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
              <p className="text-sm font-bold leading-4 text-blue-700">
                Đa Minh Thủ Đức 2
              </p>
              <p className="text-xs text-slate-500">Dashboard</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">{user?.email}</span>
            <button
              onClick={() => {
                void handleLogout();
              }}
              className="rounded-md bg-slate-900 px-3 py-2 text-white"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[220px_1fr]">
        <aside className="rounded-xl bg-white p-3">
          <nav className="flex flex-col gap-1">
            {menus.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                className={({ isActive }: { isActive: boolean }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section className="rounded-xl bg-white p-4">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
