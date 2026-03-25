import { MealSignUp, MealSignUpSlot } from "@domain/entities/MealSignUp";

export interface IMealSignUpRepository {
  findByUserAndWeek(userId: string, weekStartDate: Date): Promise<MealSignUp[]>;
  replaceWeekSlots(
    userId: string,
    weekStartDate: Date,
    slots: MealSignUpSlot[],
  ): Promise<void>;
}
