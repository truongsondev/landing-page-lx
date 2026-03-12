import { PrismaClient } from "@prisma/client";
import { SportActivity } from "@domain/entities/SportActivity";
import { ISportActivityRepository } from "@domain/repositories/ISportActivityRepository";
import { mapSportActivity } from "@infrastructure/mappers/prismaMapper";

export class SportActivityRepository implements ISportActivityRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<SportActivity | null> {
    const activity = await this.prisma.sportActivity.findUnique({
      where: { id },
      include: {
        organizerUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        images: true,
      },
    });
    return activity ? mapSportActivity(activity) : null;
  }

  async create(
    activity: Omit<SportActivity, "id" | "createdAt" | "updatedAt">,
  ): Promise<SportActivity> {
    const created = await this.prisma.sportActivity.create({
      data: activity as any,
    });
    return mapSportActivity(created);
  }

  async update(
    id: string,
    activity: Partial<SportActivity>,
  ): Promise<SportActivity> {
    const updated = await this.prisma.sportActivity.update({
      where: { id },
      data: activity as any,
    });
    return mapSportActivity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.sportActivity.delete({ where: { id } });
  }

  async findAll(
    filters?: any,
  ): Promise<{ activities: SportActivity[]; total: number }> {
    const { page = 1, limit = 10, startDate, endDate } = filters || {};

    const where: any = {};
    if (startDate) where.startDate = { gte: startDate };
    if (endDate) where.endDate = { lte: endDate };

    const [activities, total] = await Promise.all([
      this.prisma.sportActivity.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startDate: "desc" },
        include: {
          organizerUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.sportActivity.count({ where }),
    ]);

    return { activities: activities.map(mapSportActivity), total };
  }
}
