export interface ITokenCacheService {
  isRevoked(jti: string): Promise<boolean>;
  revoke(jti: string, expiresAt: Date): Promise<void>;
  cacheRefreshToken(
    tokenHash: string,
    tokenId: string,
    expiresAt: Date,
  ): Promise<void>;
  getCachedRefreshTokenId(tokenHash: string): Promise<string | null>;
  removeRefreshTokenCache(tokenHash: string): Promise<void>;
}
