import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import {
  membersService,
  type UpdateMyProfilePayload,
} from "@/services/members.service";
import { useAuthStore, type AuthState } from "@/stores/auth.store";

interface ProfileForm {
  firstName: string;
  lastName: string;
  saintName: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  bio: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ProfilePage() {
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  const user = useAuthStore((s: AuthState) => s.user);
  const hydrateMe = useAuthStore((s: AuthState) => s.hydrateMe);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      saintName: "",
      dateOfBirth: "",
      phoneNumber: "",
      address: "",
      bio: "",
    },
  });

  const passwordForm = useForm<PasswordForm>();

  const trimOrUndefined = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  };

  const toProfilePayload = (values: ProfileForm): UpdateMyProfilePayload => ({
    firstName: trimOrUndefined(values.firstName),
    lastName: trimOrUndefined(values.lastName),
    saintName: trimOrUndefined(values.saintName),
    dateOfBirth: trimOrUndefined(values.dateOfBirth),
    phoneNumber: trimOrUndefined(values.phoneNumber),
    address: trimOrUndefined(values.address),
    bio: trimOrUndefined(values.bio),
  });

  const effectiveAvatarPreview = useMemo(() => {
    if (previewUrl) return previewUrl;
    return user?.avatar || null;
  }, [previewUrl, user?.avatar]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateImage = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Chi chap nhan JPEG, PNG hoac WEBP";
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return "Anh vuot qua 5MB";
    }

    return null;
  };

  const handleAvatarFileChange = (file?: File) => {
    if (!file) return;
    const validationError = validateImage(file);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const updateProfile = useMutation({
    mutationFn: ({
      values,
      avatarFile,
    }: {
      values: UpdateMyProfilePayload;
      avatarFile?: File;
    }) => membersService.updateMyProfile(values, avatarFile),
    onSuccess: async (memberData, submittedValues) => {
      await hydrateMe();
      toast.success("Cập nhật hồ sơ thành công");

      profileForm.reset({
        firstName: submittedValues.values.firstName || "",
        lastName: submittedValues.values.lastName || "",
        saintName: memberData.saintName || "",
        dateOfBirth: memberData.dateOfBirth?.slice(0, 10) || "",
        phoneNumber: memberData.phoneNumber || "",
        address: memberData.address || "",
        bio: memberData.bio || "",
      });

      setSelectedAvatarFile(null);
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    },
    onError: (error) => {
      const typedError = error as AxiosError<{ message?: string }>;
      const status = typedError.response?.status;

      if (status === 413) {
        toast.error("Anh qua lon, vui long chon anh <= 5MB");
        return;
      }

      if (status === 502) {
        toast.error("He thong xu ly anh dang ban, vui long thu lai");
        return;
      }

      if (status === 429) {
        toast.error("Qua nhieu yeu cau. Vui long thu lai sau");
        return;
      }

      toast.error(
        typedError.response?.data?.message || "Không thể cập nhật hồ sơ",
      );
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
        <h2 className="mb-3 text-xl font-bold">Thông tin cá nhân</h2>
        <form
          className="space-y-3"
          onSubmit={profileForm.handleSubmit((values: ProfileForm) => {
            updateProfile.mutate({
              values: toProfilePayload(values),
              avatarFile: selectedAvatarFile || undefined,
            });
          })}
        >
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            {effectiveAvatarPreview ? (
              <img
                src={effectiveAvatarPreview}
                alt="Avatar preview"
                className="h-16 w-16 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                {(user?.firstName || "U").slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Chon anh avatar tu may
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  handleAvatarFileChange(event.target.files?.[0]);
                }}
                className="block w-full text-sm text-slate-700"
              />
              <p className="mt-1 text-xs text-slate-500">
                JPEG/PNG/WEBP, toi da 5MB
              </p>
            </div>
          </div>

          <input
            value={user?.email || ""}
            readOnly
            className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2"
          />
          <input
            {...profileForm.register("firstName", { maxLength: 100 })}
            placeholder="Tên"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            {...profileForm.register("lastName", { maxLength: 100 })}
            placeholder="Họ"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            {...profileForm.register("saintName", { maxLength: 200 })}
            placeholder="Tên thánh"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            type="date"
            {...profileForm.register("dateOfBirth")}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            {...profileForm.register("phoneNumber", { maxLength: 50 })}
            placeholder="Số điện thoại"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            {...profileForm.register("address", { maxLength: 500 })}
            placeholder="Địa chỉ"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <textarea
            rows={4}
            {...profileForm.register("bio")}
            placeholder="Tiểu sử"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />

          <button
            disabled={updateProfile.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          >
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
