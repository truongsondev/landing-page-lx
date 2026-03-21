import type {
  AdminMembersListResponse,
  ApiListResponse,
  Member,
} from "@/types/models";
import { api } from "@/lib/api/client";

export interface MemberQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  position?: string;
}

export interface AdminMembersQuery {
  page?: number;
  limit?: number;
  status?: "UNVERIFIED" | "PENDING" | "ACTIVE";
  sortBy?:
    | "id"
    | "email"
    | "firstName"
    | "lastName"
    | "accountStatus"
    | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface UpsertMemberPayload {
  userId?: string;
  name?: string;
  avatar?: string;
  saintName?: string;
  bio?: string;
  dateOfBirth?: string;
  school?: string;
  studentId?: string;
  phoneNumber?: string;
  address?: string;
  position?: string;
  status?: "ACTIVE" | "INACTIVE" | "ALUMNI";
}

export interface UpdateMyProfilePayload {
  firstName?: string;
  lastName?: string;
  saintName?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
}

export const membersService = {
  getAll: async (params?: MemberQuery) =>
    (await api.get<ApiListResponse<Member>>("/members", { params })).data,
  getAllAdminUsers: async (params?: AdminMembersQuery) =>
    (
      await api.get<AdminMembersListResponse>("/members/admin/users", {
        params,
      })
    ).data,
  getById: async (id: string) => (await api.get<Member>(`/members/${id}`)).data,
  create: async (payload: UpsertMemberPayload) =>
    (await api.post<Member>("/members", payload)).data,
  update: async (id: string, payload: UpsertMemberPayload) =>
    (await api.put<Member>(`/members/${id}`, payload)).data,
  updateMyProfile: async (
    payload: UpdateMyProfilePayload,
    avatarFile?: File,
  ) => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    return (await api.patch<Member>("/members/me/profile", formData)).data;
  },
  remove: async (id: string) => (await api.delete(`/members/${id}`)).data,
  changeStatus: async (id: string, status: "ACTIVE" | "INACTIVE" | "ALUMNI") =>
    (await api.patch(`/members/${id}/status`, { status })).data,
};
