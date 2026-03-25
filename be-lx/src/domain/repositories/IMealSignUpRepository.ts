import { MealSignUp, MealSignUpSlot } from "@domain/entities/MealSignUp";

export interface MealSignUpCount {
  dayOfWeek: number;
  period: "morning" | "afternoon";
  count: number;
}

export interface MealSignUpUser {
  userId: string;
  name: string;
  avatar?: string;
}

export interface IMealSignUpRepository {
  findByUserAndWeek(userId: string, weekStartDate: Date): Promise<MealSignUp[]>;
  countByWeek(weekStartDate: Date): Promise<MealSignUpCount[]>;
  findUsersByWeekSlot(
    weekStartDate: Date,
    dayOfWeek: number,
    period: "morning" | "afternoon",
  ): Promise<MealSignUpUser[]>;
  replaceWeekSlots(
    userId: string,
    weekStartDate: Date,
    slots: MealSignUpSlot[],
  ): Promise<void>;
}
