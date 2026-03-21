import { PrismaClient } from "@prisma/client";
import { User } from "@domain/entities/User";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { mapUser } from "@infrastructure/mappers/prismaMapper";

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

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
    const updated = await this.prisma.user.update({
      where: { id },
      data: user,
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
