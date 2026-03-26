import { ValidationError } from "@domain/errors/AppError";
import { MealSignUpSlot } from "@domain/entities/MealSignUp";
import { IMealSignUpRepository } from "@domain/repositories/IMealSignUpRepository";

export class MealSignUpUseCase {
  constructor(private mealSignUpRepository: IMealSignUpRepository) {}

  async getMyWeekSignUps(userId: string, weekStartDate: Date) {
    this.validateWeekStartDate(weekStartDate);

    const signUps = await this.mealSignUpRepository.findByUserAndWeek(
      userId,
      weekStartDate,
    );

    return {
      weekStartDate: this.toDateOnly(weekStartDate),
      slots: signUps.map((item) => ({
        dayOfWeek: item.dayOfWeek,
        period: item.period,
      })),
    };
  }

  async getWeekCounts(weekStartDate: Date) {
    this.validateWeekStartDate(weekStartDate);

    const counts = await this.mealSignUpRepository.countByWeek(weekStartDate);

    return {
      weekStartDate: this.toDateOnly(weekStartDate),
      counts,
    };
  }

  async getWeekSlotUsers(
    weekStartDate: Date,
    dayOfWeek: number,
    period: "morning" | "afternoon",
  ) {
    this.validateWeekStartDate(weekStartDate);

    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
      throw new ValidationError("Ngày trong tuần phải nằm trong khoảng từ 1 đến 7");
    }

    if (period !== "morning" && period !== "afternoon") {
      throw new ValidationError("Buổi ăn không hợp lệ");
    }

    const users = await this.mealSignUpRepository.findUsersByWeekSlot(
      weekStartDate,
      dayOfWeek,
      period,
    );

    return {
      weekStartDate: this.toDateOnly(weekStartDate),
      dayOfWeek,
      period,
      users,
    };
  }

  async saveMyWeekSignUps(
    userId: string,
    weekStartDate: Date,
    slots: MealSignUpSlot[],
  ) {
    this.validateWeekStartDate(weekStartDate);

    const normalizedSlots = this.normalizeAndValidateSlots(slots);

    await this.mealSignUpRepository.replaceWeekSlots(
      userId,
      weekStartDate,
      normalizedSlots,
    );

    return {
      message: "Lưu đăng ký cơm thành công",
      weekStartDate: this.toDateOnly(weekStartDate),
      slots: normalizedSlots,
    };
  }

  private normalizeAndValidateSlots(slots: MealSignUpSlot[]): MealSignUpSlot[] {
    if (!Array.isArray(slots)) {
      throw new ValidationError("Danh sách đăng ký không hợp lệ");
    }

    const seen = new Set<string>();
    const normalized: MealSignUpSlot[] = [];

    for (const slot of slots) {
      if (!slot || typeof slot !== "object") {
        throw new ValidationError("Dữ liệu đăng ký không hợp lệ");
      }

      const { dayOfWeek, period } = slot;

      if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
        throw new ValidationError("Ngày trong tuần phải nằm trong khoảng từ 1 đến 7");
      }

      if (period !== "morning" && period !== "afternoon") {
        throw new ValidationError("Buổi ăn không hợp lệ");
      }

      const key = `${dayOfWeek}-${period}`;
      if (!seen.has(key)) {
        seen.add(key);
        normalized.push({ dayOfWeek, period });
      }
    }

    return normalized;
  }

  private validateWeekStartDate(weekStartDate: Date) {
    if (!(weekStartDate instanceof Date) || Number.isNaN(weekStartDate.getTime())) {
      throw new ValidationError("Tuần đăng ký không hợp lệ");
    }
  }

  private toDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
