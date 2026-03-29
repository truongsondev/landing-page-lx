import { Router, Response, NextFunction } from "express";
import { body, query } from "express-validator";
import prisma from "@infrastructure/database/prisma";
import { validate } from "@infrastructure/middlewares/validate";
import {
  authenticate,
  authorize,
  AuthRequest,
} from "@infrastructure/middlewares/auth";
import { MealSignUpUseCase } from "@application/use-cases/MealSignUpUseCase";
import { MealSignUpRepository } from "@infrastructure/repositories/MealSignUpRepository";
import { Role } from "@domain/entities/User";

const router = Router();
const mealSignUpRepository = new MealSignUpRepository(prisma);
const mealSignUpUseCase = new MealSignUpUseCase(mealSignUpRepository);

router.get(
  "/cook-permissions",
  authenticate,
  authorize(Role.ADMIN),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await mealSignUpUseCase.getCookPermissionUsers();
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/cook-permissions",
  authenticate,
  authorize(Role.ADMIN),
  [
    body("userIds")
      .isArray()
      .withMessage("Danh sách tài khoản không hợp lệ"),
    body("userIds.*")
      .isUUID()
      .withMessage("ID tài khoản không hợp lệ"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await mealSignUpUseCase.updateCookPermissionUsers(
        req.body.userIds,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/cook-week",
  authenticate,
  [
    query("weekStartDate")
      .isISO8601()
      .withMessage("Ngày bắt đầu tuần không hợp lệ"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const weekStartDate = new Date(req.query.weekStartDate as string);
      const result = await mealSignUpUseCase.getCookWeekSchedule(weekStartDate);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/my-cook-week",
  authenticate,
  [
    query("weekStartDate")
      .isISO8601()
      .withMessage("Ngày bắt đầu tuần không hợp lệ"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const weekStartDate = new Date(req.query.weekStartDate as string);
      const result = await mealSignUpUseCase.getMyCookWeekSignUp(
        req.user!.id,
        weekStartDate,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/my-cook-week",
  authenticate,
  [
    body("weekStartDate")
      .isISO8601()
      .withMessage("Ngày bắt đầu tuần không hợp lệ"),
    body("slot").custom((value) => {
      if (value === null || value === undefined) {
        return true;
      }

      if (typeof value !== "object") {
        throw new Error("Khung giờ nấu không hợp lệ");
      }

      if (!Number.isInteger(value.dayOfWeek) || value.dayOfWeek < 1 || value.dayOfWeek > 7) {
        throw new Error("Ngày trong tuần phải nằm trong khoảng từ 1 đến 7");
      }

      if (value.period !== "morning" && value.period !== "afternoon") {
        throw new Error("Buổi nấu không hợp lệ");
      }

      return true;
    }),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await mealSignUpUseCase.saveMyCookWeekSignUp(
        req.user!.id,
        new Date(req.body.weekStartDate),
        req.body.slot ?? null,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/my-week",
  authenticate,
  [
    query("weekStartDate")
      .isISO8601()
      .withMessage("Ngày bắt đầu tuần không hợp lệ"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const weekStartDate = new Date(req.query.weekStartDate as string);
      const result = await mealSignUpUseCase.getMyWeekSignUps(
        req.user!.id,
        weekStartDate,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/week-counts",
  authenticate,
  [
    query("weekStartDate")
      .isISO8601()
      .withMessage("Ngày bắt đầu tuần không hợp lệ"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const weekStartDate = new Date(req.query.weekStartDate as string);
      const result = await mealSignUpUseCase.getWeekCounts(weekStartDate);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/week-slot-users",
  authenticate,
  [
    query("weekStartDate")
      .isISO8601()
      .withMessage("Ngày bắt đầu tuần không hợp lệ"),
    query("dayOfWeek")
      .isInt({ min: 1, max: 7 })
      .withMessage("Ngày trong tuần phải nằm trong khoảng từ 1 đến 7"),
    query("period")
      .isIn(["morning", "afternoon"])
      .withMessage("Buổi ăn không hợp lệ"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const weekStartDate = new Date(req.query.weekStartDate as string);
      const dayOfWeek = parseInt(req.query.dayOfWeek as string, 10);
      const period = req.query.period as "morning" | "afternoon";
      const result = await mealSignUpUseCase.getWeekSlotUsers(
        weekStartDate,
        dayOfWeek,
        period,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/my-week",
  authenticate,
  [
    body("weekStartDate")
      .isISO8601()
      .withMessage("Ngày bắt đầu tuần không hợp lệ"),
    body("slots")
      .isArray({ max: 14 })
      .withMessage("Danh sách đăng ký không hợp lệ"),
    body("slots.*.dayOfWeek")
      .isInt({ min: 1, max: 7 })
      .withMessage("Ngày trong tuần phải nằm trong khoảng từ 1 đến 7"),
    body("slots.*.period")
      .isIn(["morning", "afternoon"])
      .withMessage("Buổi ăn không hợp lệ"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await mealSignUpUseCase.saveMyWeekSignUps(
        req.user!.id,
        new Date(req.body.weekStartDate),
        req.body.slots,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
