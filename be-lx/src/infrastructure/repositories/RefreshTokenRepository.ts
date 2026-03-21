import { RefreshToken } from "@domain/entities/RefreshToken";
import { IRefreshTokenRepository } from "@domain/repositories/IRefreshTokenRepository";
import prismaClient from "@infrastructure/database/prisma";

const mapRefreshToken = (data: any): RefreshToken => ({
  ...data,
  deviceInfo: data.deviceInfo ?? undefined,
  ipAddress: data.ipAddress ?? undefined,
  revokedAt: data.revokedAt ?? undefined,
  revokedReason: data.revokedReason ?? undefined,
  replacedByTokenId: data.replacedByTokenId ?? undefined,
});

export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private prisma: typeof prismaClient) {}

  async create(data: {
    userId: string;
    tokenHash: string;
    tokenJti: string;
    deviceInfo?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    const created = await this.prisma.refreshToken.create({
      data,
    });
    return mapRefreshToken(created);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    return token ? mapRefreshToken(token) : null;
  }

  async findActiveByUserAndDevice(
    userId: string,
    deviceInfo: string,
  ): Promise<RefreshToken | null> {
    const token = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        deviceInfo,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
    return token ? mapRefreshToken(token) : null;
  }

  async revokeById(
    id: string,
    reason: string,
    replacedByTokenId?: string,
  ): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
        revokedReason: reason,
        replacedByTokenId,
      },
    });
  }

  async revokeAllByUserId(userId: string, reason: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: {
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }
}
