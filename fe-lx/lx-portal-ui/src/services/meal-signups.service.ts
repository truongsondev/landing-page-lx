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
};
