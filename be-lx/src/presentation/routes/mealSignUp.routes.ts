import { Router, Response, NextFunction } from "express";
import { body, query } from "express-validator";
import prisma from "@infrastructure/database/prisma";
import { validate } from "@infrastructure/middlewares/validate";
import { authenticate, AuthRequest } from "@infrastructure/middlewares/auth";
import { MealSignUpUseCase } from "@application/use-cases/MealSignUpUseCase";
import { MealSignUpRepository } from "@infrastructure/repositories/MealSignUpRepository";

const router = Router();
const mealSignUpRepository = new MealSignUpRepository(prisma);
const mealSignUpUseCase = new MealSignUpUseCase(mealSignUpRepository);

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
