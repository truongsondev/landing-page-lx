import { Prisma, PrismaClient } from "@prisma/client";
import {
  MealCookScheduleEntry,
  MealSignUp,
  MealSignUpSlot,
} from "@domain/entities/MealSignUp";
import {
  IMealSignUpRepository,
  MealCookPermissionUser,
  MealCookWindowStatus,
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

interface MealCookSignUpRecord {
  dayOfWeek: number;
  period: "morning" | "afternoon";
}

interface MealCookScheduleRecord {
  dayOfWeek: number;
  period: "morning" | "afternoon";
  userId: string;
  name: string;
  avatar: string | null;
}

interface MealCookPermissionRecord {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  role: "ADMIN" | "MEMBER";
  isAllowed: bigint | number;
}

interface MealCookWindowRecord {
  openedAt: Date;
  expiresAt: Date;
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
        COALESCE(
          NULLIF(TRIM(CONCAT(u.lastName, ' ', u.firstName)), ''),
          NULLIF(TRIM(u.name), ''),
          NULLIF(TRIM(m.name), ''),
          'Chưa cập nhật'
        ) as name,
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

  async findMyCookSlotByWeek(
    userId: string,
    weekStartDate: Date,
  ): Promise<MealSignUpSlot | null> {
    const rows = await this.prisma.$queryRaw<MealCookSignUpRecord[]>`
      SELECT
        dayOfWeek,
        period
      FROM meal_cook_signups
      WHERE userId = ${userId}
        AND weekStartDate = ${this.toDateOnly(weekStartDate)}
      LIMIT 1
    `;

    if (!rows.length) {
      return null;
    }

    return {
      dayOfWeek: rows[0].dayOfWeek,
      period: rows[0].period,
    };
  }

  async replaceMyCookSlot(
    userId: string,
    weekStartDate: Date,
    slot: MealSignUpSlot | null,
  ): Promise<void> {
    const dateOnly = this.toDateOnly(weekStartDate);

    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        DELETE FROM meal_cook_signups
        WHERE userId = ${userId}
          AND weekStartDate = ${dateOnly}
      `;

      if (!slot) {
        return;
      }

      await tx.$executeRaw`
        INSERT INTO meal_cook_signups (
          id,
          userId,
          weekStartDate,
          dayOfWeek,
          period,
          createdAt,
          updatedAt
        ) VALUES (
          UUID(),
          ${userId},
          ${dateOnly},
          ${slot.dayOfWeek},
          ${slot.period},
          NOW(),
          NOW()
        )
      `;
    });
  }

  async findCookScheduleByWeek(weekStartDate: Date): Promise<MealCookScheduleEntry[]> {
    const rows = await this.prisma.$queryRaw<MealCookScheduleRecord[]>`
      SELECT
        mcs.dayOfWeek,
        mcs.period,
        mcs.userId,
        COALESCE(
          NULLIF(TRIM(CONCAT(u.lastName, ' ', u.firstName)), ''),
          NULLIF(TRIM(u.name), ''),
          NULLIF(TRIM(m.name), ''),
          'Chưa cập nhật'
        ) as name,
        COALESCE(m.avatar, u.avatar) as avatar
      FROM meal_cook_signups mcs
      INNER JOIN users u ON u.id = mcs.userId
      LEFT JOIN members m ON m.userId = u.id
      WHERE mcs.weekStartDate = ${this.toDateOnly(weekStartDate)}
      ORDER BY mcs.dayOfWeek ASC, mcs.period ASC, name ASC
    `;

    return rows.map((row) => ({
      dayOfWeek: row.dayOfWeek,
      period: row.period,
      user: {
        userId: row.userId,
        name: row.name,
        avatar: row.avatar || undefined,
      },
    }));
  }

  async isUserAllowedCookSignUp(userId: string): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<Array<{ allowed: bigint | number }>>`
      SELECT
        COUNT(*) AS allowed
      FROM meal_cook_permissions
      WHERE userId = ${userId}
    `;

    return Number(rows[0]?.allowed || 0) > 0;
  }

  async getCookWindowStatus(referenceTime: Date = new Date()): Promise<MealCookWindowStatus> {
    const rows = await this.prisma.$queryRaw<MealCookWindowRecord[]>`
      SELECT
        openedAt,
        expiresAt
      FROM meal_cook_open_windows
      ORDER BY openedAt DESC
      LIMIT 1
    `;

    if (!rows.length) {
      return {
        openedAt: null,
        expiresAt: null,
        isOpen: false,
      };
    }

    const latestWindow = rows[0];
    const expiresAt = new Date(latestWindow.expiresAt);

    return {
      openedAt: new Date(latestWindow.openedAt),
      expiresAt,
      isOpen: expiresAt.getTime() >= referenceTime.getTime(),
    };
  }

  async openCookWindow(durationHours: number): Promise<MealCookWindowStatus> {
    const openedAt = new Date();
    const expiresAt = new Date(openedAt.getTime() + durationHours * 60 * 60 * 1000);

    await this.prisma.$executeRaw`
      INSERT INTO meal_cook_open_windows (
        id,
        openedAt,
        expiresAt,
        createdAt,
        updatedAt
      ) VALUES (
        UUID(),
        ${openedAt},
        ${expiresAt},
        NOW(),
        NOW()
      )
    `;

    return {
      openedAt,
      expiresAt,
      isOpen: true,
    };
  }

  async findCookPermissionUsers(): Promise<MealCookPermissionUser[]> {
    const rows = await this.prisma.$queryRaw<MealCookPermissionRecord[]>`
      SELECT
        u.id as userId,
        COALESCE(
          NULLIF(TRIM(CONCAT(u.lastName, ' ', u.firstName)), ''),
          NULLIF(TRIM(u.name), ''),
          u.email
        ) as name,
        u.email,
        COALESCE(m.avatar, u.avatar) as avatar,
        u.role,
        CASE WHEN mcp.userId IS NOT NULL THEN 1 ELSE 0 END as isAllowed
      FROM users u
      LEFT JOIN members m ON m.userId = u.id
      LEFT JOIN meal_cook_permissions mcp ON mcp.userId = u.id
      WHERE u.accountStatus = 'ACTIVE'
      ORDER BY name ASC
    `;

    return rows.map((row) => ({
      userId: row.userId,
      name: row.name,
      email: row.email,
      avatar: row.avatar || undefined,
      role: row.role,
      isAllowed: Number(row.isAllowed) > 0,
    }));
  }

  async replaceCookPermissionUsers(userIds: string[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`DELETE FROM meal_cook_permissions`;

      if (!userIds.length) {
        return;
      }

      const values = userIds.map((userId) =>
        Prisma.sql`(
          UUID(),
          ${userId},
          NOW(),
          NOW()
        )`,
      );

      await tx.$executeRaw`
        INSERT INTO meal_cook_permissions (
          id,
          userId,
          createdAt,
          updatedAt
        ) VALUES ${Prisma.join(values)}
      `;
    });
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
