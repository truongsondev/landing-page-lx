import type { ApiListResponse, User } from "@/types/models";
import { api } from "@/lib/api/client";

export const usersService = {
  getAll: async (params?: { page?: number; limit?: number }) =>
    (await api.get<ApiListResponse<User>>("/users", { params })).data,
  update: async (id: string, payload: Partial<User>) =>
    (await api.put<User>(`/users/${id}`, payload)).data,
};
