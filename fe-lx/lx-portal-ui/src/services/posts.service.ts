import type { ApiListResponse, Post } from "@/types/models";
import { api } from "@/lib/api/client";

export interface PostQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  authorId?: string;
  search?: string;
  status?: string;
  isPinned?: boolean;
}

export const postsService = {
  getAll: async (params?: PostQuery) =>
    (await api.get<ApiListResponse<Post>>("/posts", { params })).data,
  getBySlug: async (slug: string) =>
    (await api.get<Post>(`/posts/slug/${slug}`)).data,
  getById: async (id: string) => (await api.get<Post>(`/posts/${id}`)).data,
  create: async (payload: Partial<Post>) =>
    (await api.post<Post>("/posts", payload)).data,
  update: async (id: string, payload: Partial<Post>) =>
    (await api.put<Post>(`/posts/${id}`, payload)).data,
  remove: async (id: string) => (await api.delete(`/posts/${id}`)).data,
  publish: async (id: string) => (await api.patch(`/posts/${id}/publish`)).data,
  unpublish: async (id: string) =>
    (await api.patch(`/posts/${id}/unpublish`)).data,
};
