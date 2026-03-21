import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useAuthStore, type AuthState } from "@/stores/auth.store";

export function PublicLayout() {
  const hydrateMe = useAuthStore((s: AuthState) => s.hydrateMe);
  const isAuthenticated = useAuthStore((s: AuthState) => s.isAuthenticated);
  const user = useAuthStore((s: AuthState) => s.user);

  useEffect(() => {
    if (!isAuthenticated || user) return;
    void hydrateMe();
  }, [hydrateMe, isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
