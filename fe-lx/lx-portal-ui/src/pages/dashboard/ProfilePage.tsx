import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { usersService } from "@/services/users.service";
import { useAuthStore, type AuthState } from "@/stores/auth.store";

interface AccountForm {
  firstName: string;
  lastName: string;
  avatar: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ProfilePage() {
  const user = useAuthStore((s: AuthState) => s.user);
  const hydrateMe = useAuthStore((s: AuthState) => s.hydrateMe);

  const accountForm = useForm<AccountForm>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      avatar: user?.avatar || "",
    },
  });

  const passwordForm = useForm<PasswordForm>();

  const updateAccount = useMutation({
    mutationFn: (payload: AccountForm) =>
      usersService.update(user?.id || "", payload),
    onSuccess: async () => {
      await hydrateMe();
      toast.success("Cập nhật hồ sơ thành công");
    },
  });

  const changePassword = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công");
      passwordForm.reset();
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="rounded-xl border border-slate-200 p-4">
        <h2 className="mb-3 text-xl font-bold">Thông tin tài khoản</h2>
        <form
          className="space-y-3"
          onSubmit={accountForm.handleSubmit((v: AccountForm) =>
            updateAccount.mutate(v),
          )}
        >
          <input
            value={user?.email || ""}
            readOnly
            className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2"
          />
          <input
            {...accountForm.register("firstName")}
            placeholder="Tên"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            {...accountForm.register("lastName")}
            placeholder="Họ"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            {...accountForm.register("avatar")}
            placeholder="Avatar URL"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white">
            Cập nhật
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 p-4">
        <h2 className="mb-3 text-xl font-bold">Đổi mật khẩu</h2>
        <form
          className="space-y-3"
          onSubmit={passwordForm.handleSubmit((v: PasswordForm) =>
            changePassword.mutate(v),
          )}
        >
          <input
            type="password"
            {...passwordForm.register("currentPassword", { required: true })}
            placeholder="Mật khẩu hiện tại"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            type="password"
            {...passwordForm.register("newPassword", { required: true })}
            placeholder="Mật khẩu mới"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            type="password"
            {...passwordForm.register("confirmPassword", { required: true })}
            placeholder="Xác nhận mật khẩu mới"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <button className="rounded-md bg-slate-900 px-4 py-2 text-white">
            Đổi mật khẩu
          </button>
        </form>
      </section>
    </div>
  );
}
