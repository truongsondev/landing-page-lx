import { PrismaClient } from "@prisma/client";
import { MealSignUp, MealSignUpSlot } from "@domain/entities/MealSignUp";
import { IMealSignUpRepository } from "@domain/repositories/IMealSignUpRepository";

export class MealSignUpRepository implements IMealSignUpRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserAndWeek(userId: string, weekStartDate: Date): Promise<MealSignUp[]> {
    return this.prisma.mealSignUp.findMany({
      where: {
        userId,
        weekStartDate: new Date(this.toDateOnly(weekStartDate)),
      },
      orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }],
    });
  }

  async replaceWeekSlots(
    userId: string,
    weekStartDate: Date,
    slots: MealSignUpSlot[],
  ): Promise<void> {
    const normalizedWeekStartDate = new Date(this.toDateOnly(weekStartDate));

    await this.prisma.$transaction(async (tx) => {
      await tx.mealSignUp.deleteMany({
        where: {
          userId,
          weekStartDate: normalizedWeekStartDate,
        },
      });

      if (!slots.length) {
        return;
      }

      await tx.mealSignUp.createMany({
        data: slots.map((slot) => ({
          userId,
          weekStartDate: normalizedWeekStartDate,
          dayOfWeek: slot.dayOfWeek,
          period: slot.period,
        })),
      });
    });
  }

  private toDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
