import { Router, Request, Response, NextFunction } from "express";
import { body, param, query } from "express-validator";
import { AuthUseCase } from "@application/use-cases/AuthUseCase";
import { UserRepository } from "@infrastructure/repositories/UserRepository";
import { RefreshTokenRepository } from "@infrastructure/repositories/RefreshTokenRepository";
import { SMTPEmailService } from "@infrastructure/services/SMTPEmailService";
import { RedisTokenCacheService } from "@infrastructure/services/RedisTokenCacheService";
import prisma from "@infrastructure/database/prisma";
import {
  AuthRequest,
  authenticate,
  authorize,
} from "@infrastructure/middlewares/auth";
import { authLimiter } from "@infrastructure/middlewares/rateLimiter";
import { validate } from "@infrastructure/middlewares/validate";
import { Role } from "@domain/entities/User";

const router = Router();
const userRepository = new UserRepository(prisma);
const refreshTokenRepository = new RefreshTokenRepository(prisma);
const emailService = new SMTPEmailService();
const tokenCacheService = new RedisTokenCacheService();
const authUseCase = new AuthUseCase(
  userRepository,
  refreshTokenRepository,
  emailService,
  tokenCacheService,
);

router.post(
  "/register",
  authLimiter, // Apply strict rate limiting
  [
    body("email").isEmail().normalizeEmail().withMessage("Email không hợp lệ"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
    body("firstName")
      .trim()
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage("Tên là bắt buộc và tối đa 100 ký tự"),
    body("lastName")
      .trim()
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage("Họ là bắt buộc và tối đa 100 ký tự"),
  ],
  validate, // Use validation middleware
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      // DO NOT accept role from request body - security fix
      const result = await authUseCase.register({
        email,
        password,
        firstName,
        lastName,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/login",
  authLimiter, // Apply strict rate limiting
  [
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("password").notEmpty().withMessage("Mật khẩu là bắt buộc"),
  ],
  validate, // Use validation middleware
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await authUseCase.login(email, password, {
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/refresh-token",
  authLimiter,
  [body("refreshToken").notEmpty().withMessage("Refresh token là bắt buộc")],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const result = await authUseCase.refreshAccessToken(refreshToken, {
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/logout",
  [body("refreshToken").notEmpty().withMessage("Refresh token là bắt buộc")],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const result = await authUseCase.logout(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/me",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await authUseCase.getMe(req.user!.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/verify-email",
  authLimiter,
  [query("token").exists().isString().withMessage("Mã xác thực không hợp lệ")],
  validate,
  async (req: AuthRequest, res: Response) => {
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const successBaseUrl =
      process.env.EMAIL_VERIFY_SUCCESS_URL || `${appUrl}/email-verified`;
    const failedBaseUrl =
      process.env.EMAIL_VERIFY_FAILED_URL || `${appUrl}/email-verify-failed`;

    try {
      const token = req.query.token as string;
      const result = await authUseCase.verifyEmail(token);
      const redirectUrl = `${successBaseUrl}?status=success&message=${encodeURIComponent(result.message)}`;
      return res.redirect(302, redirectUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Xác thực email thất bại";
      const redirectUrl = `${failedBaseUrl}?status=error&message=${encodeURIComponent(message)}`;
      return res.redirect(302, redirectUrl);
    }
  },
);

router.patch(
  "/users/:id/activate",
  authenticate,
  authorize(Role.ADMIN),
  [param("id").isUUID().withMessage("ID người dùng không hợp lệ")],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await authUseCase.activateUser(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
