import type { ApiListResponse, Member } from "@/types/models";
import { api } from "@/lib/api/client";

export interface MemberQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  position?: string;
}

export const membersService = {
  getAll: async (params?: MemberQuery) =>
    (await api.get<ApiListResponse<Member>>("/members", { params })).data,
  getById: async (id: string) => (await api.get<Member>(`/members/${id}`)).data,
  create: async (payload: Partial<Member>) =>
    (await api.post<Member>("/members", payload)).data,
  update: async (id: string, payload: Partial<Member>) =>
    (await api.put<Member>(`/members/${id}`, payload)).data,
  remove: async (id: string) => (await api.delete(`/members/${id}`)).data,
  changeStatus: async (id: string, status: string) =>
    (await api.patch(`/members/${id}/status`, { status })).data,
};
