import { Router, Request, Response, NextFunction } from "express";
import { body, query, param } from "express-validator";
import { PostUseCase } from "@application/use-cases/PostUseCase";
import { PostRepository } from "@infrastructure/repositories/PostRepository";
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
const cloudinaryService = new CloudinaryService();
const postUseCase = new PostUseCase(postRepository, cloudinaryService);

// Public routes - only show PUBLISHED posts
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("categoryId").optional().isUUID().withMessage("Invalid category ID"),
    query("authorId").optional().isUUID().withMessage("Invalid author ID"),
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
  [param("id").isUUID().withMessage("Invalid post ID")],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const post = await postUseCase.getPostById(req.params.id);
      // Only show if published
      if (post.status !== PostStatus.PUBLISHED) {
        return res.status(404).json({ message: "Post not found" });
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
        return res.status(404).json({ message: "Post not found" });
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
      .withMessage("Title is required and must be less than 500 characters"),
    body("slug")
      .notEmpty()
      .isLength({ max: 200 })
      .withMessage("Slug is required and must be less than 200 characters"),
    body("content").notEmpty().withMessage("Content is required"),
    body("categoryId").isUUID().withMessage("Valid category UUID is required"),
    body("location")
      .notEmpty()
      .isLength({ max: 500 })
      .withMessage("Location is required and must be less than 500 characters"),
    body("eventTime")
      .notEmpty()
      .isISO8601()
      .withMessage("Event time is required and must be a valid datetime"),
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
    param("id").isUUID().withMessage("Invalid post ID"),
    body("location")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Location must be less than 500 characters"),
    body("eventTime")
      .optional()
      .isISO8601()
      .withMessage("Event time must be a valid datetime"),
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
  [param("id").isUUID().withMessage("Invalid post ID")],
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
  [param("id").isUUID().withMessage("Invalid post ID")],
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
  [param("id").isUUID().withMessage("Invalid post ID")],
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
