import { Router, Request, Response, NextFunction } from "express";
import { body, query, param } from "express-validator";
import { SportActivityUseCase } from "@application/use-cases/SportActivityUseCase";
import { SportActivityRepository } from "@infrastructure/repositories/SportActivityRepository";
import { CloudinaryService } from "@infrastructure/services/CloudinaryService";
import prisma from "@infrastructure/database/prisma";
import {
  authenticate,
  authorize,
  AuthRequest,
} from "@infrastructure/middlewares/auth";
import { upload } from "@infrastructure/middlewares/upload";
import { uploadLimiter } from "@infrastructure/middlewares/rateLimiter";
import { validate } from "@infrastructure/middlewares/validate";
import { Role } from "@domain/entities/User";

const router = Router();
const sportActivityRepository = new SportActivityRepository(prisma);
const cloudinaryService = new CloudinaryService();
const sportActivityUseCase = new SportActivityUseCase(
  sportActivityRepository,
  cloudinaryService,
);

// Public routes
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Trang phải là số nguyên dương"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Giới hạn phải nằm trong khoảng từ 1 đến 100"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query;
      const result = await sportActivityUseCase.getAllActivities({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:id",
  [param("id").isUUID().withMessage("ID hoạt động không hợp lệ")],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const activity = await sportActivityUseCase.getActivityById(
        req.params.id,
      );
      res.json(activity);
    } catch (error) {
      next(error);
    }
  },
);

// Protected routes
router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN, Role.MEMBER),
  uploadLimiter, // Rate limit uploads
  upload.single("thumbnail"),
  [
    body("name")
      .notEmpty()
      .isLength({ max: 500 })
      .withMessage("Tên hoạt động là bắt buộc và tối đa 500 ký tự"),
    body("startDate").isISO8601().withMessage("Ngày bắt đầu không hợp lệ"),
    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("Ngày kết thúc không hợp lệ"),
    body("location")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Địa điểm tối đa 500 ký tự"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const activityData = {
        ...req.body,
        organizerId: req.user!.id,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };
      const activity = await sportActivityUseCase.createActivity(
        activityData,
        req.file,
      );
      res.status(201).json(activity);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.ADMIN, Role.MEMBER),
  uploadLimiter, // Rate limit uploads
  upload.single("thumbnail"),
  [
    param("id").isUUID().withMessage("ID hoạt động không hợp lệ"),
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("Ngày bắt đầu không hợp lệ"),
    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("Ngày kết thúc không hợp lệ"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const updateData = {
        ...req.body,
        startDate: req.body.startDate
          ? new Date(req.body.startDate)
          : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };
      const activity = await sportActivityUseCase.updateActivity(
        req.params.id,
        updateData,
        req.file,
      );
      res.json(activity);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN, Role.MEMBER),
  [param("id").isUUID().withMessage("ID hoạt động không hợp lệ")],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await sportActivityUseCase.deleteActivity(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export default router;
