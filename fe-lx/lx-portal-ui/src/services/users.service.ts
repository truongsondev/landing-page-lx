import type { ApiListResponse, User } from "@/types/models";
import { api } from "@/lib/api/client";

export const usersService = {
  getAll: async (params?: { page?: number; limit?: number }) =>
    (await api.get<ApiListResponse<User>>("/users", { params })).data,
  update: async (id: string, payload: Partial<User>) =>
    (await api.put<User>(`/users/${id}`, payload)).data,
  approve: async (id: string) =>
    (await api.patch<{ message: string }>(`/auth/users/${id}/approve`)).data,
  block: async (id: string) =>
    (await api.patch<{ message: string }>(`/auth/users/${id}/block`)).data,
  reject: async (id: string, reason: string) =>
    (
      await api.patch<{ message: string }>(`/auth/users/${id}/reject`, {
        reason,
      })
    ).data,
};
