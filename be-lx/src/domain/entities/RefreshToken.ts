import { IEntity } from "./IEntity";

export interface RefreshToken extends IEntity {
  userId: string;
  tokenHash: string;
  tokenJti: string;
  deviceInfo?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  revokedReason?: string | null;
  replacedByTokenId?: string | null;
}
