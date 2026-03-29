import {
  MealCookScheduleEntry,
  MealSignUp,
  MealSignUpSlot,
} from "@domain/entities/MealSignUp";

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

export interface MealCookPermissionUser {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: "ADMIN" | "MEMBER";
  isAllowed: boolean;
}

export interface MealCookWindowStatus {
  openedAt: Date | null;
  expiresAt: Date | null;
  isOpen: boolean;
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
  findMyCookSlotByWeek(
    userId: string,
    weekStartDate: Date,
  ): Promise<MealSignUpSlot | null>;
  replaceMyCookSlot(
    userId: string,
    weekStartDate: Date,
    slot: MealSignUpSlot | null,
  ): Promise<void>;
  findCookScheduleByWeek(weekStartDate: Date): Promise<MealCookScheduleEntry[]>;
  isUserAllowedCookSignUp(userId: string): Promise<boolean>;
  getCookWindowStatus(referenceTime?: Date): Promise<MealCookWindowStatus>;
  openCookWindow(durationHours: number): Promise<MealCookWindowStatus>;
  findCookPermissionUsers(): Promise<MealCookPermissionUser[]>;
  replaceCookPermissionUsers(userIds: string[]): Promise<void>;
}
