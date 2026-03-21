import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, UserCircle, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { ProfilePage } from "@/pages/dashboard/ProfilePage";

const menus = [
  { to: "/", label: "Trang chủ" },
  { to: "/posts", label: "Thông báo" },
  { to: "/members", label: "Thành viên" },
  { to: "/activities", label: "Hoạt động" },
  { to: "/meal-sign-up", label: "Lịch nấu" },
];

export function PublicHeader() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const fullName = [user?.lastName, user?.firstName].filter(Boolean).join(" ");

  const handleLogout = async () => {
    await logout();
    setOpenMenu(false);
    navigate("/login");
  };

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!openProfileModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [openProfileModal]);

  return (
    <>
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
          <div className="relative flex gap-2" ref={menuRef}>
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu((prev) => !prev);
                  }}
                  className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={fullName || user?.email || "User avatar"}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                      {(user?.firstName || "U").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-40 truncate">
                    {fullName || user?.email || "Tai khoan"}
                  </span>
                </button>

                {openMenu && (
                  <div className="absolute right-0 top-12 z-30 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(false);
                        setOpenProfileModal(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <UserCircle size={16} />
                      Thông tin cá nhân
                    </button>

                    {user?.role === "ADMIN" && (
                      <Link
                        to="/dashboard"
                        onClick={() => {
                          setOpenMenu(false);
                        }}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <LayoutDashboard size={16} />
                        Quản lí website
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        void handleLogout();
                      }}
                      className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-md border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-600"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      {openProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setOpenProfileModal(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-semibold text-slate-900">
                Thông tin cá nhân
              </h2>
              <button
                type="button"
                onClick={() => setOpenProfileModal(false)}
                className="rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <ProfilePage />
          </div>
        </div>
      )}
    </>
  );
}
