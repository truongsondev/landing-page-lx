import { Prisma, PrismaClient } from "@prisma/client";
import { MealSignUp, MealSignUpSlot } from "@domain/entities/MealSignUp";
import {
  IMealSignUpRepository,
  MealSignUpCount,
  MealSignUpUser,
} from "@domain/repositories/IMealSignUpRepository";

interface MealSignUpRecord {
  id: string;
  userId: string;
  weekStartDate: Date;
  dayOfWeek: number;
  period: "morning" | "afternoon";
  createdAt: Date;
  updatedAt: Date;
}

interface MealSignUpCountRecord {
  dayOfWeek: number;
  period: "morning" | "afternoon";
  count: bigint | number;
}

interface MealSignUpUserRecord {
  userId: string;
  name: string;
  avatar: string | null;
}

export class MealSignUpRepository implements IMealSignUpRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserAndWeek(userId: string, weekStartDate: Date): Promise<MealSignUp[]> {
    const rows = await this.prisma.$queryRaw<MealSignUpRecord[]>`
      SELECT
        id,
        userId,
        weekStartDate,
        dayOfWeek,
        period,
        createdAt,
        updatedAt
      FROM meal_signups
      WHERE userId = ${userId}
        AND weekStartDate = ${this.toDateOnly(weekStartDate)}
      ORDER BY dayOfWeek ASC, period ASC
    `;

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      weekStartDate: new Date(row.weekStartDate),
      dayOfWeek: row.dayOfWeek,
      period: row.period,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  async countByWeek(weekStartDate: Date): Promise<MealSignUpCount[]> {
    const rows = await this.prisma.$queryRaw<MealSignUpCountRecord[]>`
      SELECT
        dayOfWeek,
        period,
        COUNT(*) as count
      FROM meal_signups
      WHERE weekStartDate = ${this.toDateOnly(weekStartDate)}
      GROUP BY dayOfWeek, period
    `;

    return rows.map((row) => ({
      dayOfWeek: row.dayOfWeek,
      period: row.period,
      count: Number(row.count),
    }));
  }

  async findUsersByWeekSlot(
    weekStartDate: Date,
    dayOfWeek: number,
    period: "morning" | "afternoon",
  ): Promise<MealSignUpUser[]> {
    const rows = await this.prisma.$queryRaw<MealSignUpUserRecord[]>`
      SELECT
        ms.userId,
        COALESCE(m.name, CONCAT(u.lastName, ' ', u.firstName)) as name,
        COALESCE(m.avatar, u.avatar) as avatar
      FROM meal_signups ms
      INNER JOIN users u ON u.id = ms.userId
      LEFT JOIN members m ON m.userId = u.id
      WHERE ms.weekStartDate = ${this.toDateOnly(weekStartDate)}
        AND ms.dayOfWeek = ${dayOfWeek}
        AND ms.period = ${period}
      ORDER BY name ASC
    `;

    return rows.map((row) => ({
      userId: row.userId,
      name: row.name,
      avatar: row.avatar || undefined,
    }));
  }

  async replaceWeekSlots(
    userId: string,
    weekStartDate: Date,
    slots: MealSignUpSlot[],
  ): Promise<void> {
    const dateOnly = this.toDateOnly(weekStartDate);

    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        DELETE FROM meal_signups
        WHERE userId = ${userId}
          AND weekStartDate = ${dateOnly}
      `;

      if (!slots.length) {
        return;
      }

      const values = slots.map((slot) =>
        Prisma.sql`(
          UUID(),
          ${userId},
          ${dateOnly},
          ${slot.dayOfWeek},
          ${slot.period},
          NOW(),
          NOW()
        )`,
      );

      await tx.$executeRaw`
        INSERT INTO meal_signups (
          id,
          userId,
          weekStartDate,
          dayOfWeek,
          period,
          createdAt,
          updatedAt
        ) VALUES ${Prisma.join(values)}
      `;
    });
  }

  private toDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
