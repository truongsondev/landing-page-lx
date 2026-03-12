import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "@domain/errors/AppError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", err);

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === "P2002") {
      const target = err.meta?.target as string[] | undefined;
      const field = target ? target[0] : "field";
      return res.status(409).json({
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        field,
      });
    }

    // Foreign key constraint violation
    if (err.code === "P2003") {
      return res.status(400).json({
        message: "Invalid reference to related resource",
        field: err.meta?.field_name,
      });
    }

    // Record not found
    if (err.code === "P2025") {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    // Record to delete does not exist
    if (err.code === "P2016") {
      return res.status(404).json({
        message: "Resource not found",
      });
    }
  }

  // Handle Prisma validation errors (invalid UUID, etc.)
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: "Invalid data format or parameters",
    });
  }

  // Handle specific known errors
  if (err.message.includes("not found")) {
    return res.status(404).json({ message: err.message });
  }

  if (
    err.message.includes("already exists") ||
    err.message.includes("already registered")
  ) {
    return res.status(409).json({ message: err.message });
  }

  if (
    err.message.includes("Invalid credentials") ||
    err.message.includes("Invalid token")
  ) {
    return res.status(401).json({ message: err.message });
  }

  if (err.message.includes("Validation failed")) {
    return res.status(400).json({ message: err.message });
  }

  // Default server error
  return res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
