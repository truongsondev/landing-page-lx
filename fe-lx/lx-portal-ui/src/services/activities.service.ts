import type { Activity, ApiListResponse } from "@/types/models";
import { api } from "@/lib/api/client";

export interface ActivityQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const activitiesService = {
  getAll: async (params?: ActivityQuery) =>
    (await api.get<ApiListResponse<Activity>>("/activities", { params })).data,
  getById: async (id: string) =>
    (await api.get<Activity>(`/activities/${id}`)).data,
  create: async (payload: Partial<Activity>) =>
    (await api.post<Activity>("/activities", payload)).data,
  update: async (id: string, payload: Partial<Activity>) =>
    (await api.put<Activity>(`/activities/${id}`, payload)).data,
  remove: async (id: string) => (await api.delete(`/activities/${id}`)).data,
};
