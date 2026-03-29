import { api } from "@/lib/api/client";

export type MealPeriod = "morning" | "afternoon";

export interface MealSignUpSlotPayload {
  dayOfWeek: number;
  period: MealPeriod;
}

export interface MealWeekResponse {
  weekStartDate: string;
  slots: MealSignUpSlotPayload[];
}

export interface MealCountItem {
  dayOfWeek: number;
  period: MealPeriod;
  count: number;
}

export interface MealWeekCountsResponse {
  weekStartDate: string;
  counts: MealCountItem[];
}

export interface MealSlotUser {
  userId: string;
  name: string;
  avatar?: string;
}

export interface MealWeekSlotUsersResponse {
  weekStartDate: string;
  dayOfWeek: number;
  period: MealPeriod;
  users: MealSlotUser[];
}

export interface SaveMealWeekPayload {
  weekStartDate: string;
  slots: MealSignUpSlotPayload[];
}

export interface MealCookSlotUser {
  userId: string;
  name: string;
  avatar?: string;
}

export interface MealCookScheduleSlot {
  dayOfWeek: number;
  period: MealPeriod;
  users: MealCookSlotUser[];
}

export interface MealCookWeekResponse {
  weekStartDate: string;
  slots: MealCookScheduleSlot[];
}

export interface MyCookWeekResponse {
  weekStartDate: string;
  slot: MealSignUpSlotPayload | null;
  canSignUp: boolean;
  registrationWindow: {
    openedAt: string | null;
    expiresAt: string | null;
    isOpen: boolean;
  };
}

export interface SaveMyCookWeekPayload {
  weekStartDate: string;
  slot: MealSignUpSlotPayload | null;
}

export interface CookPermissionUser {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: "ADMIN" | "MEMBER";
  isAllowed: boolean;
}

export interface CookPermissionListResponse {
  users: CookPermissionUser[];
  registrationWindow: {
    openedAt: string | null;
    expiresAt: string | null;
    isOpen: boolean;
  };
}

export interface UpdateCookPermissionsPayload {
  userIds: string[];
}

export interface UpdateCookPermissionsResponse {
  message: string;
  userIds: string[];
  registrationWindow: {
    openedAt: string | null;
    expiresAt: string | null;
    isOpen: boolean;
  };
}

export const mealSignUpsService = {
  getMyWeek: async (weekStartDate: string) =>
    (
      await api.get<MealWeekResponse>("/meal-signups/my-week", {
        params: { weekStartDate },
      })
    ).data,

  saveMyWeek: async (payload: SaveMealWeekPayload) =>
    (await api.post<MealWeekResponse>("/meal-signups/my-week", payload)).data,

  getWeekCounts: async (weekStartDate: string) =>
    (
      await api.get<MealWeekCountsResponse>("/meal-signups/week-counts", {
        params: { weekStartDate },
      })
    ).data,

  getWeekSlotUsers: async (
    weekStartDate: string,
    dayOfWeek: number,
    period: MealPeriod,
  ) =>
    (
      await api.get<MealWeekSlotUsersResponse>("/meal-signups/week-slot-users", {
        params: { weekStartDate, dayOfWeek, period },
      })
    ).data,

  getCookWeek: async (weekStartDate: string) =>
    (
      await api.get<MealCookWeekResponse>("/meal-signups/cook-week", {
        params: { weekStartDate },
      })
    ).data,

  getMyCookWeek: async (weekStartDate: string) =>
    (
      await api.get<MyCookWeekResponse>("/meal-signups/my-cook-week", {
        params: { weekStartDate },
      })
    ).data,

  saveMyCookWeek: async (payload: SaveMyCookWeekPayload) =>
    (await api.post<MyCookWeekResponse>("/meal-signups/my-cook-week", payload)).data,

  getCookPermissions: async () =>
    (await api.get<CookPermissionListResponse>("/meal-signups/cook-permissions")).data,

  updateCookPermissions: async (payload: UpdateCookPermissionsPayload) =>
    (await api.put<UpdateCookPermissionsResponse>("/meal-signups/cook-permissions", payload)).data,
};
