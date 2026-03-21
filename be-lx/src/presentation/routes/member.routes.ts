import { Router, Request, Response, NextFunction } from "express";
import { body, query, param } from "express-validator";
import { MemberUseCase } from "@application/use-cases/MemberUseCase";
import { MemberRepository } from "@infrastructure/repositories/MemberRepository";
import { UserRepository } from "@infrastructure/repositories/UserRepository";
import { CloudinaryService } from "@infrastructure/services/CloudinaryService";
import prisma from "@infrastructure/database/prisma";
import {
  authenticate,
  authorize,
  AuthRequest,
} from "@infrastructure/middlewares/auth";
import { validate } from "@infrastructure/middlewares/validate";
import { upload } from "@infrastructure/middlewares/upload";
import { uploadLimiter } from "@infrastructure/middlewares/rateLimiter";
import { AccountStatus, Role } from "@domain/entities/User";
import { MemberStatus } from "@domain/entities/Member";

const router = Router();
const memberRepository = new MemberRepository(prisma);
const userRepository = new UserRepository(prisma);
const cloudinaryService = new CloudinaryService();
const memberUseCase = new MemberUseCase(
  memberRepository,
  userRepository,
  cloudinaryService,
);

// Public routes - only show ACTIVE members
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

// Admin route - list members from users table with account status filters
router.get(
  "/admin/users",
  authenticate,
  authorize(Role.ADMIN),
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Trang phải là số nguyên dương"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Giới hạn phải nằm trong khoảng từ 1 đến 100"),
    query("status")
      .optional()
      .isIn(Object.values(AccountStatus))
      .withMessage("Trạng thái tài khoản không hợp lệ"),
    query("sortBy")
      .optional()
      .isIn([
        "id",
        "email",
        "firstName",
        "lastName",
        "accountStatus",
        "createdAt",
      ])
      .withMessage("Trường sắp xếp không hợp lệ"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Thứ tự sắp xếp phải là asc hoặc desc"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit, status, sortBy, sortOrder } = req.query;

      const result = await memberUseCase.getAllMembersForAdmin({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as AccountStatus,
        sortBy: sortBy as
          | "id"
          | "email"
          | "firstName"
          | "lastName"
          | "accountStatus"
          | "createdAt",
        sortOrder: sortOrder as "asc" | "desc",
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:id",
  [param("id").isUUID().withMessage("ID thành viên không hợp lệ")],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const member = await memberUseCase.getMemberById(req.params.id);
      // Only show if active
      if (member.status !== MemberStatus.ACTIVE) {
        return res.status(404).json({ message: "Không tìm thấy thành viên" });
      }
      res.json(member);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/me/profile",
  authenticate,
  uploadLimiter,
  upload.single("avatar"),
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Tên tối đa 100 ký tự"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Họ tối đa 100 ký tự"),
    body("avatar")
      .optional()
      .isURL()
      .withMessage("Ảnh đại diện phải là URL hợp lệ"),
    body("saintName")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Tên thánh tối đa 200 ký tự"),
    body("dateOfBirth")
      .optional()
      .isISO8601()
      .withMessage("Ngày sinh không hợp lệ"),
    body("phoneNumber")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Số điện thoại tối đa 50 ký tự"),
    body("address")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Địa chỉ tối đa 500 ký tự"),
    body("bio").optional().isString().withMessage("Tiểu sử phải là chuỗi"),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await memberUseCase.updateMyMemberProfile(req.user!.id, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        avatar: req.body.avatar,
        avatarFile: req.file,
        saintName: req.body.saintName,
        dateOfBirth: req.body.dateOfBirth
          ? new Date(req.body.dateOfBirth)
          : undefined,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        bio: req.body.bio,
      });

      res.json(result);
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
    body("userId").isUUID().withMessage("ID người dùng không hợp lệ"),
    body("name")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Tên tối đa 200 ký tự"),
    body("avatar")
      .optional()
      .isURL()
      .withMessage("Ảnh đại diện phải là URL hợp lệ"),
    body("saintName")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Tên thánh tối đa 200 ký tự"),
    body("bio").optional().isString().withMessage("Tiểu sử phải là chuỗi"),
    body("dateOfBirth")
      .optional()
      .isISO8601()
      .withMessage("Ngày sinh không hợp lệ"),
    body("school")
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage("Trường học tối đa 300 ký tự"),
    body("studentId")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Mã sinh viên tối đa 50 ký tự"),
    body("phoneNumber")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Số điện thoại tối đa 50 ký tự"),
    body("address")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Địa chỉ tối đa 500 ký tự"),
    body("position")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Chức vụ tối đa 200 ký tự"),
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
    param("id").isUUID().withMessage("ID thành viên không hợp lệ"),
    body("name")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Tên tối đa 200 ký tự"),
    body("avatar")
      .optional()
      .isURL()
      .withMessage("Ảnh đại diện phải là URL hợp lệ"),
    body("saintName")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Tên thánh tối đa 200 ký tự"),
    body("bio").optional().isString().withMessage("Tiểu sử phải là chuỗi"),
    body("dateOfBirth")
      .optional()
      .isISO8601()
      .withMessage("Ngày sinh không hợp lệ"),
    body("school")
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage("Trường học tối đa 300 ký tự"),
    body("studentId")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Mã sinh viên tối đa 50 ký tự"),
    body("phoneNumber")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Số điện thoại tối đa 50 ký tự"),
    body("address")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Địa chỉ tối đa 500 ký tự"),
    body("position")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Chức vụ tối đa 200 ký tự"),
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
  [param("id").isUUID().withMessage("ID thành viên không hợp lệ")],
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
    param("id").isUUID().withMessage("ID thành viên không hợp lệ"),
    body("status")
      .isIn(Object.values(MemberStatus))
      .withMessage("Giá trị trạng thái không hợp lệ"),
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
