import { ForbiddenError, ValidationError } from "@domain/errors/AppError";
import {
  MealCookSignUpSlot,
  MealSignUpSlot,
} from "@domain/entities/MealSignUp";
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

  async getMyCookWeekSignUp(userId: string, weekStartDate: Date) {
    this.validateWeekStartDate(weekStartDate);

    const [isAllowed, cookWindowStatus] = await Promise.all([
      this.mealSignUpRepository.isUserAllowedCookSignUp(userId),
      this.mealSignUpRepository.getCookWindowStatus(),
    ]);

    const slot = await this.mealSignUpRepository.findMyCookSlotByWeek(
      userId,
      weekStartDate,
    );

    return {
      weekStartDate: this.toDateOnly(weekStartDate),
      slot,
      canSignUp: isAllowed && cookWindowStatus.isOpen,
      registrationWindow: {
        openedAt: cookWindowStatus.openedAt
          ? cookWindowStatus.openedAt.toISOString()
          : null,
        expiresAt: cookWindowStatus.expiresAt
          ? cookWindowStatus.expiresAt.toISOString()
          : null,
        isOpen: cookWindowStatus.isOpen,
      },
    };
  }

  async saveMyCookWeekSignUp(
    userId: string,
    weekStartDate: Date,
    slot: MealCookSignUpSlot | null,
  ) {
    this.validateWeekStartDate(weekStartDate);

    const [isAllowed, cookWindowStatus] = await Promise.all([
      this.mealSignUpRepository.isUserAllowedCookSignUp(userId),
      this.mealSignUpRepository.getCookWindowStatus(),
    ]);

    if (!cookWindowStatus.isOpen) {
      throw new ForbiddenError("Đợt đăng ký nấu cơm đang khóa hoặc đã hết hạn");
    }

    if (!isAllowed) {
      throw new ForbiddenError("Bạn chưa được admin cấp quyền đăng ký nấu cơm");
    }

    const normalizedSlot = this.normalizeAndValidateCookSlot(slot);

    await this.mealSignUpRepository.replaceMyCookSlot(
      userId,
      weekStartDate,
      normalizedSlot,
    );

    return {
      message: normalizedSlot
        ? "Lưu lịch nấu cơm thành công"
        : "Đã xóa lịch nấu cơm",
      weekStartDate: this.toDateOnly(weekStartDate),
      slot: normalizedSlot,
    };
  }

  async getCookPermissionUsers() {
    const [users, cookWindowStatus] = await Promise.all([
      this.mealSignUpRepository.findCookPermissionUsers(),
      this.mealSignUpRepository.getCookWindowStatus(),
    ]);

    return {
      users,
      registrationWindow: {
        openedAt: cookWindowStatus.openedAt
          ? cookWindowStatus.openedAt.toISOString()
          : null,
        expiresAt: cookWindowStatus.expiresAt
          ? cookWindowStatus.expiresAt.toISOString()
          : null,
        isOpen: cookWindowStatus.isOpen,
      },
    };
  }

  async updateCookPermissionUsers(userIds: string[]) {
    if (!Array.isArray(userIds)) {
      throw new ValidationError("Danh sách tài khoản không hợp lệ");
    }

    const normalizedUserIds = Array.from(
      new Set(
        userIds.filter(
          (id) =>
            typeof id === "string" &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id),
        ),
      ),
    );

    await this.mealSignUpRepository.replaceCookPermissionUsers(normalizedUserIds);
    const cookWindowStatus = await this.mealSignUpRepository.openCookWindow(24);

    return {
      message: "Đã mở đăng ký nấu cơm trong 24 giờ",
      userIds: normalizedUserIds,
      registrationWindow: {
        openedAt: cookWindowStatus.openedAt
          ? cookWindowStatus.openedAt.toISOString()
          : null,
        expiresAt: cookWindowStatus.expiresAt
          ? cookWindowStatus.expiresAt.toISOString()
          : null,
        isOpen: cookWindowStatus.isOpen,
      },
    };
  }

  async getCookWeekSchedule(weekStartDate: Date) {
    this.validateWeekStartDate(weekStartDate);

    const entries = await this.mealSignUpRepository.findCookScheduleByWeek(
      weekStartDate,
    );

    const slotMap = new Map<string, { dayOfWeek: number; period: "morning" | "afternoon"; users: { userId: string; name: string; avatar?: string }[] }>();

    for (const entry of entries) {
      const key = `${entry.dayOfWeek}-${entry.period}`;
      const existing = slotMap.get(key);

      if (existing) {
        existing.users.push(entry.user);
      } else {
        slotMap.set(key, {
          dayOfWeek: entry.dayOfWeek,
          period: entry.period,
          users: [entry.user],
        });
      }
    }

    return {
      weekStartDate: this.toDateOnly(weekStartDate),
      slots: Array.from(slotMap.values()).sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) {
          return a.dayOfWeek - b.dayOfWeek;
        }
        return a.period.localeCompare(b.period);
      }),
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

  private normalizeAndValidateCookSlot(
    slot: MealCookSignUpSlot | null,
  ): MealCookSignUpSlot | null {
    if (!slot) {
      return null;
    }

    const { dayOfWeek, period } = slot;

    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
      throw new ValidationError("Ngày trong tuần phải nằm trong khoảng từ 1 đến 7");
    }

    if (period !== "morning" && period !== "afternoon") {
      throw new ValidationError("Buổi nấu không hợp lệ");
    }

    return { dayOfWeek, period };
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
