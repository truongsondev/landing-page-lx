import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@domain/entities/User";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Yêu cầu đăng nhập" });
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "secret",
    ) as {
      id: string;
      email: string;
      role: Role;
      type?: "access" | "refresh";
    };

    if (decoded.type && decoded.type !== "access") {
      return res.status(401).json({ message: "Access token không hợp lệ" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Yêu cầu đăng nhập" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Không đủ quyền truy cập" });
    }

    next();
  };
};
