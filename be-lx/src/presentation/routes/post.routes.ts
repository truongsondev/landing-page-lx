import { Router, Request, Response, NextFunction } from "express";
import { body, query, param } from "express-validator";
import { PostUseCase } from "@application/use-cases/PostUseCase";
import { PostRepository } from "@infrastructure/repositories/PostRepository";
import { ImageRepository } from "@infrastructure/repositories/ImageRepository";
import { CloudinaryService } from "@infrastructure/services/CloudinaryService";
import prisma from "@infrastructure/database/prisma";
import {
  authenticate,
  authorize,
  AuthRequest,
} from "@infrastructure/middlewares/auth";
import { upload } from "@infrastructure/middlewares/upload";
import {
  uploadLimiter,
  viewCountLimiter,
} from "@infrastructure/middlewares/rateLimiter";
import { validate } from "@infrastructure/middlewares/validate";
import { Role } from "@domain/entities/User";
import { PostStatus } from "@domain/entities/Post";

const router = Router();
const postRepository = new PostRepository(prisma);
const imageRepository = new ImageRepository(prisma);
const cloudinaryService = new CloudinaryService();
const postUseCase = new PostUseCase(
  postRepository,
  cloudinaryService,
  imageRepository,
);

// Public routes - only show PUBLISHED posts
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
    query("categoryId")
      .optional()
      .isUUID()
      .withMessage("ID danh mục không hợp lệ"),
    query("authorId")
      .optional()
      .isUUID()
      .withMessage("ID tác giả không hợp lệ"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit, categoryId, authorId } = req.query;
      // Force status to PUBLISHED for public access
      const result = await postUseCase.getAllPosts({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: PostStatus.PUBLISHED, // Only show published posts
        categoryId: categoryId as string,
        authorId: authorId as string,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:id",
  [param("id").isUUID().withMessage("ID bài viết không hợp lệ")],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const post = await postUseCase.getPostById(req.params.id);
      // Only show if published
      if (post.status !== PostStatus.PUBLISHED) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }
      res.json(post);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/slug/:slug",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const post = await postUseCase.getPostBySlug(req.params.slug);
      // Only show if published
      if (post.status !== PostStatus.PUBLISHED) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }
      res.json(post);
    } catch (error) {
      next(error);
    }
  },
);

// Protected routes
router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  uploadLimiter, // Rate limit uploads
  upload.single("thumbnail"),
  [
    body("title")
      .notEmpty()
      .isLength({ max: 500 })
      .withMessage("Tiêu đề là bắt buộc và tối đa 500 ký tự"),
    body("slug")
      .notEmpty()
      .isLength({ max: 200 })
      .withMessage("Slug là bắt buộc và tối đa 200 ký tự"),
    body("content").notEmpty().withMessage("Nội dung là bắt buộc"),
    body("categoryId").isUUID().withMessage("ID danh mục không hợp lệ"),
    body("location")
      .notEmpty()
      .isLength({ max: 500 })
      .withMessage("Địa điểm là bắt buộc và tối đa 500 ký tự"),
    body("eventTime")
      .notEmpty()
      .isISO8601()
      .withMessage("Thời gian sự kiện là bắt buộc và phải đúng định dạng"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const postData = {
        ...req.body,
        authorId: req.user!.id,
        isPinned: req.body.isPinned === "true",
        eventTime: new Date(req.body.eventTime),
      };
      const post = await postUseCase.createPost(postData, req.file);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  uploadLimiter, // Rate limit uploads
  upload.single("thumbnail"),
  [
    param("id").isUUID().withMessage("ID bài viết không hợp lệ"),
    body("location")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Địa điểm tối đa 500 ký tự"),
    body("eventTime")
      .optional()
      .isISO8601()
      .withMessage("Thời gian sự kiện phải đúng định dạng"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const updateData = {
        ...req.body,
        eventTime: req.body.eventTime
          ? new Date(req.body.eventTime)
          : undefined,
      };
      const post = await postUseCase.updatePost(
        req.params.id,
        updateData,
        req.file,
      );
      res.json(post);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  [param("id").isUUID().withMessage("ID bài viết không hợp lệ")],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await postUseCase.deletePost(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:id/publish",
  authenticate,
  authorize(Role.ADMIN),
  [param("id").isUUID().withMessage("ID bài viết không hợp lệ")],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const post = await postUseCase.publishPost(req.params.id);
      res.json(post);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:id/unpublish",
  authenticate,
  authorize(Role.ADMIN),
  [param("id").isUUID().withMessage("ID bài viết không hợp lệ")],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const post = await postUseCase.unpublishPost(req.params.id);
      res.json(post);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
