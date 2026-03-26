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
};
