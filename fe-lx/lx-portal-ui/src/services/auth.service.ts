import type { AuthResponse, User } from "@/types/models";
import { api } from "@/lib/api/client";

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  termsAccepted: boolean;
}

export const authService = {
  login: async (payload: LoginPayload) =>
    (await api.post<AuthResponse>("/auth/login", payload)).data,
  register: async (payload: RegisterPayload) =>
    (await api.post<AuthResponse>("/auth/register", payload)).data,
  getMe: async () => (await api.get<User>("/users/me")).data,
  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => (await api.post("/auth/change-password", payload)).data,
};
