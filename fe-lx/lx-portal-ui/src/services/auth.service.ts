import type { LoginResponse, RefreshTokenResponse, User } from "@/types/models";
import { api } from "@/lib/api/client";

export type UserProfileResponse = Pick<
  User,
  "id" | "email" | "firstName" | "lastName" | "avatar"
>;

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  user: User & {
    accountStatus: "UNVERIFIED" | "PENDING" | "ACTIVE" | "REJECTED";
    emailVerified: boolean;
    emailVerifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}

export const authService = {
  login: async (payload: LoginPayload) =>
    (await api.post<LoginResponse>("/auth/login", payload)).data,
  register: async (payload: RegisterPayload) =>
    (await api.post<RegisterResponse>("/auth/register", payload)).data,
  refreshToken: async (refreshToken: string) =>
    (
      await api.post<RefreshTokenResponse>("/auth/refresh-token", {
        refreshToken,
      })
    ).data,
  logout: async (refreshToken: string) =>
    (await api.post<LogoutResponse>("/auth/logout", { refreshToken })).data,
  verifyEmail: async (token: string) =>
    (
      await api.get<VerifyEmailResponse>("/auth/verify-email", {
        params: { token },
      })
    ).data,
  getMe: async () => (await api.get<UserProfileResponse>("/users/me")).data,
  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => (await api.post("/auth/change-password", payload)).data,
};
