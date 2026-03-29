import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { postsService } from "@/services/posts.service";
import { membersService } from "@/services/members.service";
import { activitiesService } from "@/services/activities.service";
import { mealSignUpsService } from "@/services/meal-signups.service";
import { useAuthStore, type AuthState } from "@/stores/auth.store";
import { Loading } from "@/components/common/Loading";

export function DashboardPage() {
  const user = useAuthStore((s: AuthState) => s.user);

  const draftPosts = useQuery({
    queryKey: ["dashboard", "posts"],
    queryFn: () => postsService.getAll({ limit: 5, status: "DRAFT" }),
    enabled: user?.role === "ADMIN" || user?.role === "MODERATOR",
  });

  const members = useQuery({
    queryKey: ["dashboard", "members"],
    queryFn: () => membersService.getAll({ limit: 5 }),
    enabled: user?.role === "ADMIN",
  });

  const activities = useQuery({
    queryKey: ["dashboard", "activities"],
    queryFn: () => activitiesService.getAll({ limit: 3 }),
  });

  const cookPermissions = useQuery({
    queryKey: ["dashboard", "meal-cook-permissions"],
    queryFn: () => mealSignUpsService.getCookPermissions(),
    enabled: user?.role === "ADMIN",
  });

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const formatDateTime = (value: string | null) => {
    if (!value) {
      return "Chưa mở";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Chưa mở";
    }

    return date.toLocaleString("vi-VN", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (!cookPermissions.data?.users) {
      return;
    }

    setSelectedUserIds(
      cookPermissions.data.users
        .filter((account) => account.isAllowed)
        .map((account) => account.userId),
    );
  }, [cookPermissions.data]);

  const allowedSet = useMemo(() => new Set(selectedUserIds), [selectedUserIds]);

  const hasPermissionChanges = useMemo(() => {
    const currentAllowed = new Set(
      (cookPermissions.data?.users || [])
        .filter((account) => account.isAllowed)
        .map((account) => account.userId),
    );

    if (currentAllowed.size !== allowedSet.size) {
      return true;
    }

    for (const id of allowedSet) {
      if (!currentAllowed.has(id)) {
        return true;
      }
    }

    return false;
  }, [allowedSet, cookPermissions.data]);

  const updateCookPermissionsMutation = useMutation({
    mutationFn: () =>
      mealSignUpsService.updateCookPermissions({
        userIds: selectedUserIds,
      }),
    onSuccess: async () => {
      await cookPermissions.refetch();
      toast.success("Đã mở đăng ký nấu cơm trong 24 giờ");
    },
    onError: () => {
      toast.error("Cập nhật quyền đăng ký nấu cơm thất bại");
    },
  });

  const toggleUserPermission = (userId: string) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const resetPermissionChanges = () => {
    setSelectedUserIds(
      (cookPermissions.data?.users || [])
        .filter((account) => account.isAllowed)
        .map((account) => account.userId),
    );
  };

  const cookWindow = cookPermissions.data?.registrationWindow;
  const isCookWindowOpen = cookWindow?.isOpen ?? false;

  const cookPermissionsErrorMessage = useMemo(() => {
    if (!cookPermissions.error) {
      return null;
    }

    if (axios.isAxiosError(cookPermissions.error)) {
      const status = cookPermissions.error.response?.status;
      const apiMessage = (cookPermissions.error.response?.data as { message?: string } | undefined)?.message;

      if (status && apiMessage) {
        return `${apiMessage} (HTTP ${status})`;
      }

      if (apiMessage) {
        return apiMessage;
      }

      if (status) {
        return `Yêu cầu thất bại (HTTP ${status})`;
      }
    }

    return "Không thể tải danh sách tài khoản.";
  }, [cookPermissions.error]);

  if (activities.isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Bài viết nháp</p>
          <p className="text-2xl font-bold">
            {draftPosts.data?.data?.length || 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Thành viên</p>
          <p className="text-2xl font-bold">
            {members.data?.data?.length || 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Hoạt động sắp tới</p>
          <p className="text-2xl font-bold">
            {activities.data?.data?.length || 0}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/dashboard/posts/create"
          className="rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white"
        >
          Tạo bài viết mới
        </Link>
        <Link
          to="/dashboard/activities/create"
          className="rounded-lg bg-indigo-600 px-4 py-3 text-center font-semibold text-white"
        >
          Tạo hoạt động mới
        </Link>
        <Link
          to="/dashboard/members/create"
          className="rounded-lg bg-slate-900 px-4 py-3 text-center font-semibold text-white"
        >
          Thêm thành viên
        </Link>
      </div>

      {user?.role === "ADMIN" && (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mở đăng ký nấu cơm</h2>
            <span className="text-sm text-slate-500">
              Đã chọn: {selectedUserIds.length}
            </span>
          </div>
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p>
              Trạng thái: {isCookWindowOpen ? "Đang mở" : "Đã khóa"}
            </p>
            <p>
              Ngày mở: {formatDateTime(cookWindow?.openedAt ?? null)}
            </p>
            <p>
              Hạn mở (24h): {formatDateTime(cookWindow?.expiresAt ?? null)}
            </p>
          </div>
          <p className="mb-4 text-sm text-slate-600">
            Chỉ các tài khoản được chọn mới có thể lưu đăng ký nấu cơm trong thời gian đang mở.
          </p>

          {cookPermissions.isLoading ? (
            <p className="text-sm text-slate-500">Đang tải danh sách tài khoản...</p>
          ) : cookPermissions.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {cookPermissionsErrorMessage || "Không thể tải danh sách tài khoản."}
            </div>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
              {(cookPermissions.data?.users || []).map((account) => (
                <label
                  key={account.userId}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-indigo-600"
                    checked={allowedSet.has(account.userId)}
                    onChange={() => toggleUserPermission(account.userId)}
                  />
                  {account.avatar ? (
                    <img
                      src={account.avatar}
                      alt={account.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                      {account.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{account.name}</p>
                    <p className="truncate text-xs text-slate-500">{account.email}</p>
                    <p className="truncate text-[11px] text-slate-400">
                      Mở gần nhất: {formatDateTime(cookWindow?.openedAt ?? null)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-end gap-2">
            {hasPermissionChanges && (
              <button
                type="button"
                onClick={resetPermissionChanges}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Quay lại
              </button>
            )}
            <button
              type="button"
              onClick={() => updateCookPermissionsMutation.mutate()}
              disabled={updateCookPermissionsMutation.isPending}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateCookPermissionsMutation.isPending
                ? "Đang mở..."
                : isCookWindowOpen
                  ? "Mở lại 24h"
                  : "Mở đăng ký 24h"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
