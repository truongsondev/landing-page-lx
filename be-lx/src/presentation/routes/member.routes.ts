import { Router, Request, Response, NextFunction } from "express";
import { body, query, param } from "express-validator";
import { MemberUseCase } from "@application/use-cases/MemberUseCase";
import { MemberRepository } from "@infrastructure/repositories/MemberRepository";
import prisma from "@infrastructure/database/prisma";
import {
  authenticate,
  authorize,
  AuthRequest,
} from "@infrastructure/middlewares/auth";
import { validate } from "@infrastructure/middlewares/validate";
import { Role } from "@domain/entities/User";
import { MemberStatus } from "@domain/entities/Member";

const router = Router();
const memberRepository = new MemberRepository(prisma);
const memberUseCase = new MemberUseCase(memberRepository);

// Public routes - only show ACTIVE members
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
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query;
      // Force status to ACTIVE for public access
      const result = await memberUseCase.getAllMembers({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: MemberStatus.ACTIVE, // Only show active members
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:id",
  [param("id").isUUID().withMessage("Invalid member ID")],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const member = await memberUseCase.getMemberById(req.params.id);
      // Only show if active
      if (member.status !== MemberStatus.ACTIVE) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.json(member);
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
  [
    body("userId").isUUID().withMessage("Valid user UUID is required"),
    body("name")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Name must be less than 200 characters"),
    body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),
    body("saintName")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Saint name must be less than 200 characters"),
    body("bio").optional().isString().withMessage("Bio must be a string"),
    body("dateOfBirth")
      .optional()
      .isISO8601()
      .withMessage("Date of birth must be a valid date"),
    body("school")
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage("School must be less than 300 characters"),
    body("studentId")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Student ID must be less than 50 characters"),
    body("phoneNumber")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Phone number must be less than 50 characters"),
    body("address")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Address must be less than 500 characters"),
    body("position")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Position must be less than 200 characters"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memberData = {
        ...req.body,
        dateOfBirth: req.body.dateOfBirth
          ? new Date(req.body.dateOfBirth)
          : undefined,
      };
      const member = await memberUseCase.createMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  [
    param("id").isUUID().withMessage("Invalid member ID"),
    body("name")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Name must be less than 200 characters"),
    body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),
    body("saintName")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Saint name must be less than 200 characters"),
    body("bio").optional().isString().withMessage("Bio must be a string"),
    body("dateOfBirth")
      .optional()
      .isISO8601()
      .withMessage("Date of birth must be a valid date"),
    body("school")
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage("School must be less than 300 characters"),
    body("studentId")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Student ID must be less than 50 characters"),
    body("phoneNumber")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Phone number must be less than 50 characters"),
    body("address")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Address must be less than 500 characters"),
    body("position")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Position must be less than 200 characters"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const updateData = {
        ...req.body,
        dateOfBirth: req.body.dateOfBirth
          ? new Date(req.body.dateOfBirth)
          : undefined,
      };
      const member = await memberUseCase.updateMember(
        req.params.id,
        updateData,
      );
      res.json(member);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  [param("id").isUUID().withMessage("Invalid member ID")],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await memberUseCase.deleteMember(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:id/status",
  authenticate,
  authorize(Role.ADMIN),
  [
    param("id").isUUID().withMessage("Invalid member ID"),
    body("status")
      .isIn(Object.values(MemberStatus))
      .withMessage("Invalid status value"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const member = await memberUseCase.updateMemberStatus(
        req.params.id,
        status,
      );
      res.json(member);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
