import { User, Role, AccountStatus } from "@domain/entities/User";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { IRefreshTokenRepository } from "@domain/repositories/IRefreshTokenRepository";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@domain/errors/AppError";
import { IEmailService } from "@domain/services/IEmailService";
import { ITokenCacheService } from "@domain/services/ITokenCacheService";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]) || "15m";
const REFRESH_TOKEN_EXPIRES_IN_RAW =
  process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRES_IN: SignOptions["expiresIn"] =
  REFRESH_TOKEN_EXPIRES_IN_RAW as SignOptions["expiresIn"];

export class AuthUseCase {
  constructor(
    private userRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository,
    private emailService: IEmailService,
    private tokenCacheService: ITokenCacheService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: Omit<User, "password">; message: string }> {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(
      data.email.toLowerCase().trim(),
    );
    if (existingUser) {
      throw new ConflictError("Email đã được đăng ký");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Create user as MEMBER and require email verification before login.
    const user = await this.userRepository.create({
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      role: Role.MEMBER,
      accountStatus: AccountStatus.UNVERIFIED,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: verificationTokenExpiresAt,
    });

    const verificationBaseUrl =
      process.env.EMAIL_VERIFY_BASE_URL ||
      process.env.APP_URL ||
      "http://localhost:3000";
    const verificationLink = `${verificationBaseUrl}/api/auth/verify-email?token=${verificationToken}`;

    await this.emailService.sendEmailVerification({
      email: user.email,
      firstName: user.firstName,
      verificationLink,
    });

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      message:
        "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
    };
  }

  async login(
    email: string,
    password: string,
    context?: { deviceInfo?: string; ipAddress?: string },
  ): Promise<{
    user: {
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string;
      role: Role;
    };
    accessToken: string;
    refreshToken: string;
  }> {
    // Find user
    const user = await this.userRepository.findByEmail(
      email.toLowerCase().trim(),
    );
    if (!user) {
      throw new UnauthorizedError("Email hoặc mật khẩu không đúng");
    }

    if (!user.emailVerified) {
      throw new ForbiddenError(
        "Email chưa được xác thực. Vui lòng xác thực email trước khi đăng nhập.",
      );
    }

    if (user.accountStatus === AccountStatus.PENDING) {
      throw new ForbiddenError(
        "Tài khoản đang được chờ admin duyệt, vui lòng chờ",
      );
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenError("Tài khoản chưa được kích hoạt");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError("Email hoặc mật khẩu không đúng");
    }

    const normalizedDeviceInfo =
      context?.deviceInfo?.trim() || "unknown-device";
    const activeSession =
      await this.refreshTokenRepository.findActiveByUserAndDevice(
        user.id,
        normalizedDeviceInfo,
      );
    if (activeSession) {
      throw new ConflictError(
        "Thiết bị này đã đăng nhập. Vui lòng đăng xuất trước khi đăng nhập lại",
      );
    }

    const accessToken = this.generateAccessToken(user);
    const { token: refreshToken, tokenJti } = this.generateRefreshToken(user);
    const refreshTokenHash = this.hashToken(refreshToken);
    const refreshTokenExpiresAt = this.calculateRefreshTokenExpiry();

    const savedToken = await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: refreshTokenHash,
      tokenJti,
      deviceInfo: normalizedDeviceInfo,
      ipAddress: context?.ipAddress,
      expiresAt: refreshTokenExpiresAt,
    });

    await this.tokenCacheService.cacheRefreshToken(
      refreshTokenHash,
      savedToken.id,
      refreshTokenExpiresAt,
    );

    return {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(
    refreshToken: string,
    context?: { deviceInfo?: string; ipAddress?: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new BadRequestError("Thiếu refresh token");
    }

    const decoded = this.verifyRefreshToken(refreshToken);

    if (await this.tokenCacheService.isRevoked(decoded.jti)) {
      throw new UnauthorizedError("Refresh token đã bị thu hồi");
    }

    const tokenHash = this.hashToken(refreshToken);
    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedError("Refresh token không hợp lệ");
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedError("Refresh token đã bị thu hồi");
    }

    if (storedToken.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError("Refresh token đã hết hạn");
    }

    if (storedToken.tokenJti !== decoded.jti) {
      throw new UnauthorizedError("Refresh token không hợp lệ");
    }

    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenError("Tài khoản chưa được kích hoạt");
    }

    const newAccessToken = this.generateAccessToken(user);
    const { token: newRefreshToken, tokenJti: newRefreshTokenJti } =
      this.generateRefreshToken(user);
    const newRefreshTokenHash = this.hashToken(newRefreshToken);
    const newRefreshTokenExpiresAt = this.calculateRefreshTokenExpiry();

    const newStoredToken = await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: newRefreshTokenHash,
      tokenJti: newRefreshTokenJti,
      deviceInfo: context?.deviceInfo,
      ipAddress: context?.ipAddress,
      expiresAt: newRefreshTokenExpiresAt,
    });

    await this.refreshTokenRepository.revokeById(
      storedToken.id,
      "ROTATED",
      newStoredToken.id,
    );

    await this.tokenCacheService.revoke(
      storedToken.tokenJti,
      storedToken.expiresAt,
    );
    await this.tokenCacheService.removeRefreshTokenCache(tokenHash);
    await this.tokenCacheService.cacheRefreshToken(
      newRefreshTokenHash,
      newStoredToken.id,
      newRefreshTokenExpiresAt,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    if (!refreshToken) {
      throw new BadRequestError("Thiếu refresh token");
    }

    const decoded = this.verifyRefreshToken(refreshToken);
    const tokenHash = this.hashToken(refreshToken);
    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (storedToken && !storedToken.revokedAt) {
      await this.refreshTokenRepository.revokeById(storedToken.id, "LOGOUT");
      await this.tokenCacheService.revoke(
        storedToken.tokenJti,
        storedToken.expiresAt,
      );
      await this.tokenCacheService.removeRefreshTokenCache(tokenHash);
    } else {
      // Ensure token cannot be reused even if it was not found in DB.
      await this.tokenCacheService.revoke(
        decoded.jti,
        new Date(decoded.exp * 1000),
      );
    }

    return { message: "Đăng xuất thành công" };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestError("Thiếu mã xác thực");
    }

    const user = await this.userRepository.findByEmailVerificationToken(token);
    if (!user) {
      throw new BadRequestError("Mã xác thực không hợp lệ");
    }

    if (
      !user.emailVerificationTokenExpiresAt ||
      user.emailVerificationTokenExpiresAt.getTime() < Date.now()
    ) {
      await this.userRepository.update(user.id, {
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      });
      throw new BadRequestError("Mã xác thực đã hết hạn");
    }

    await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      accountStatus: AccountStatus.PENDING,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    });

    return {
      message:
        "Xác thực email thành công. Tài khoản của bạn đang chờ admin duyệt.",
    };
  }

  async activateUser(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError("Không tìm thấy người dùng");
    }

    if (!user.emailVerified) {
      throw new BadRequestError(
        "Không thể kích hoạt tài khoản trước khi xác thực email",
      );
    }

    await this.userRepository.update(user.id, {
      accountStatus: AccountStatus.ACTIVE,
    });

    return { message: "Kích hoạt tài khoản thành công" };
  }

  async getMe(userId: string): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError("Không tìm thấy người dùng");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    };
  }

  private generateAccessToken(user: User): string {
    const secret =
      process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "secret";
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        type: "access",
      },
      secret,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
    );
  }

  private generateRefreshToken(user: User): {
    token: string;
    tokenJti: string;
  } {
    const secret =
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || "secret";
    const tokenJti = crypto.randomUUID();
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        type: "refresh",
      },
      secret,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        jwtid: tokenJti,
      },
    );

    return { token, tokenJti };
  }

  private verifyRefreshToken(token: string): {
    id: string;
    email: string;
    role: Role;
    type: "refresh";
    jti: string;
    exp: number;
  } {
    try {
      const decoded = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || "secret",
      ) as {
        id: string;
        email: string;
        role: Role;
        type: "refresh";
        jti: string;
        exp: number;
      };

      if (decoded.type !== "refresh" || !decoded.jti) {
        throw new UnauthorizedError("Refresh token không hợp lệ");
      }

      return decoded;
    } catch (error) {
      throw new UnauthorizedError("Refresh token không hợp lệ");
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private calculateRefreshTokenExpiry(): Date {
    const raw = REFRESH_TOKEN_EXPIRES_IN_RAW.trim();
    const match = raw.match(/^(\d+)([smhd])$/i);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    const unitToMs: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * unitToMs[unit]);
  }

  async verifyToken(
    token: string,
  ): Promise<{ id: string; email: string; role: Role }> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "secret",
      ) as {
        id: string;
        email: string;
        role: Role;
        type: "access";
      };

      if (decoded.type !== "access") {
        throw new UnauthorizedError("Access token không hợp lệ");
      }
      return decoded;
    } catch (error) {
      throw new UnauthorizedError("Token không hợp lệ");
    }
  }
}
