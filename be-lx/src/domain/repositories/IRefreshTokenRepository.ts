import { RefreshToken } from "@domain/entities/RefreshToken";

export interface IRefreshTokenRepository {
  create(data: {
    userId: string;
    tokenHash: string;
    tokenJti: string;
    deviceInfo?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<RefreshToken>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  findActiveByUserAndDevice(
    userId: string,
    deviceInfo: string,
  ): Promise<RefreshToken | null>;
  revokeById(
    id: string,
    reason: string,
    replacedByTokenId?: string,
  ): Promise<void>;
  revokeAllByUserId(userId: string, reason: string): Promise<void>;
  deleteExpired(): Promise<number>;
}
