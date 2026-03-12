import { PrismaClient } from "@prisma/client";
import { Member } from "@domain/entities/Member";
import { IMemberRepository } from "@domain/repositories/IMemberRepository";
import { mapMember } from "@infrastructure/mappers/prismaMapper";

export class MemberRepository implements IMemberRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Member | null> {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    return member ? mapMember(member) : null;
  }

  async findByUserId(userId: string): Promise<Member | null> {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    return member ? mapMember(member) : null;
  }

  async create(
    member: Omit<Member, "id" | "createdAt" | "updatedAt">,
  ): Promise<Member> {
    const created = await this.prisma.member.create({ data: member as any });
    return mapMember(created);
  }

  async update(id: string, member: Partial<Member>): Promise<Member> {
    const updated = await this.prisma.member.update({
      where: { id },
      data: member as any,
    });
    return mapMember(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.member.delete({ where: { id } });
  }

  async findAll(filters?: any): Promise<{ members: Member[]; total: number }> {
    const { page = 1, limit = 10, status } = filters || {};

    const where: any = {};
    if (status) where.status = status;

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.member.count({ where }),
    ]);

    return { members: members.map(mapMember), total };
  }
}
