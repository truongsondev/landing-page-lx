import { User } from "@domain/entities/User";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { mapUser } from "@infrastructure/mappers/prismaMapper";
import prismaClient from "@infrastructure/database/prisma";

export class UserRepository implements IUserRepository {
  constructor(private prisma: typeof prismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? mapUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return user ? mapUser(user) : null;
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });
    return user ? mapUser(user) : null;
  }

  async create(
    user: Omit<User, "id" | "createdAt" | "updatedAt">,
  ): Promise<User> {
    const created = await this.prisma.user.create({ data: user as any });
    return mapUser(created);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    // Keep input flexible while preserving compatibility with Prisma generated enum types.
    const data: any = { ...user };

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });
    return mapUser(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async findAll(filters?: any): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
    });
    return users.map(mapUser);
  }
}
