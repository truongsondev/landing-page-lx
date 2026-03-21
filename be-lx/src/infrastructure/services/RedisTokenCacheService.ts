import { createClient, RedisClientType } from "redis";
import { ITokenCacheService } from "@domain/services/ITokenCacheService";

export class RedisTokenCacheService implements ITokenCacheService {
  private client?: RedisClientType;
  private disabled = false;

  private async getClient(): Promise<RedisClientType | undefined> {
    if (this.disabled) {
      return undefined;
    }

    if (!this.client) {
      const redisUrl = process.env.REDIS_URL;
      if (!redisUrl) {
        this.disabled = true;
        return undefined;
      }

      this.client = createClient({ url: redisUrl });
      this.client.on("error", (err) => {
        console.error("Redis error:", err.message);
      });

      try {
        await this.client.connect();
      } catch (error) {
        this.disabled = true;
        return undefined;
      }
    }

    return this.client;
  }

  async isRevoked(jti: string): Promise<boolean> {
    const client = await this.getClient();
    if (!client) {
      return false;
    }
    const key = `revoked:jti:${jti}`;
    const exists = await client.exists(key);
    return exists === 1;
  }

  async revoke(jti: string, expiresAt: Date): Promise<void> {
    const client = await this.getClient();
    if (!client) {
      return;
    }
    const ttl = Math.max(
      1,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    );
    const key = `revoked:jti:${jti}`;
    await client.set(key, "1", { EX: ttl });
  }

  async cacheRefreshToken(
    tokenHash: string,
    tokenId: string,
    expiresAt: Date,
  ): Promise<void> {
    const client = await this.getClient();
    if (!client) {
      return;
    }
    const ttl = Math.max(
      1,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    );
    const key = `refresh:hash:${tokenHash}`;
    await client.set(key, tokenId, { EX: ttl });
  }

  async getCachedRefreshTokenId(tokenHash: string): Promise<string | null> {
    const client = await this.getClient();
    if (!client) {
      return null;
    }
    const key = `refresh:hash:${tokenHash}`;
    return client.get(key);
  }

  async removeRefreshTokenCache(tokenHash: string): Promise<void> {
    const client = await this.getClient();
    if (!client) {
      return;
    }
    const key = `refresh:hash:${tokenHash}`;
    await client.del(key);
  }
}
