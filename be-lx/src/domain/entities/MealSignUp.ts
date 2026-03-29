import { IEntity } from "./IEntity";

export type MealPeriod = "morning" | "afternoon";

export interface MealSignUp extends IEntity {
  userId: string;
  weekStartDate: Date;
  dayOfWeek: number;
  period: MealPeriod;
}

export interface MealSignUpSlot {
  dayOfWeek: number;
  period: MealPeriod;
}

export interface MealCookSignUpSlot {
  dayOfWeek: number;
  period: MealPeriod;
}

export interface MealCookSignUpUser {
  userId: string;
  name: string;
  avatar?: string;
}

export interface MealCookScheduleEntry extends MealCookSignUpSlot {
  user: MealCookSignUpUser;
}
