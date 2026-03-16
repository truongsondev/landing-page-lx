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

export interface UpsertPostPayload {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  categoryId?: string;
  status?: "DRAFT" | "PENDING" | "PUBLISHED" | "ARCHIVED";
  isPinned?: boolean;
  publishAt?: string;
  location?: string;
  eventTime?: string;
  thumbnail?: File | null;
}

const appendIfDefined = (
  formData: FormData,
  key: string,
  value: string | boolean | File | null | undefined,
) => {
  if (value === undefined || value === null || value === "") return;
  if (typeof value === "boolean") {
    formData.append(key, String(value));
    return;
  }
  formData.append(key, value);
};

const toPostFormData = (payload: UpsertPostPayload) => {
  const formData = new FormData();

  appendIfDefined(formData, "title", payload.title);
  appendIfDefined(formData, "slug", payload.slug);
  appendIfDefined(formData, "content", payload.content);
  appendIfDefined(formData, "excerpt", payload.excerpt);
  appendIfDefined(formData, "categoryId", payload.categoryId);
  appendIfDefined(formData, "status", payload.status);
  appendIfDefined(formData, "isPinned", payload.isPinned);
  appendIfDefined(formData, "publishAt", payload.publishAt);
  appendIfDefined(formData, "location", payload.location);
  appendIfDefined(formData, "eventTime", payload.eventTime);
  appendIfDefined(formData, "thumbnail", payload.thumbnail);

  return formData;
};

export const postsService = {
  getAll: async (params?: PostQuery) =>
    (await api.get<ApiListResponse<Post>>("/posts", { params })).data,
  getBySlug: async (slug: string) =>
    (await api.get<Post>(`/posts/slug/${slug}`)).data,
  getById: async (id: string) => (await api.get<Post>(`/posts/${id}`)).data,
  create: async (payload: UpsertPostPayload) =>
    (await api.post<Post>("/posts", toPostFormData(payload))).data,
  update: async (id: string, payload: UpsertPostPayload) =>
    (await api.put<Post>(`/posts/${id}`, toPostFormData(payload))).data,
  remove: async (id: string) => (await api.delete(`/posts/${id}`)).data,
  publish: async (id: string) => (await api.patch(`/posts/${id}/publish`)).data,
  unpublish: async (id: string) =>
    (await api.patch(`/posts/${id}/unpublish`)).data,
};
