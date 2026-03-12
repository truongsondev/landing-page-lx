import { Router, Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { AuthUseCase } from "@application/use-cases/AuthUseCase";
import { UserRepository } from "@infrastructure/repositories/UserRepository";
import prisma from "@infrastructure/database/prisma";
import { AuthRequest } from "@infrastructure/middlewares/auth";
import { authLimiter } from "@infrastructure/middlewares/rateLimiter";
import { validate } from "@infrastructure/middlewares/validate";

const router = Router();
const userRepository = new UserRepository(prisma);
const authUseCase = new AuthUseCase(userRepository);

router.post(
  "/register",
  authLimiter, // Apply strict rate limiting
  [
    body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 8 })
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      )
      .withMessage(
        "Password must be at least 8 characters with uppercase, lowercase, number and special character",
      ),
    body("firstName")
      .trim()
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage(
        "First name is required and must be less than 100 characters",
      ),
    body("lastName")
      .trim()
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage(
        "Last name is required and must be less than 100 characters",
      ),
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
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate, // Use validation middleware
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await authUseCase.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
