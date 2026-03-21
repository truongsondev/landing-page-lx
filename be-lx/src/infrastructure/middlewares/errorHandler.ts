import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import multer from "multer";
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

  // Handle multer upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        message: "Kích thước ảnh vượt quá giới hạn 5MB",
      });
    }

    return res.status(400).json({
      message: err.message,
    });
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === "P2002") {
      const target = err.meta?.target as string[] | undefined;
      const field = target ? target[0] : "field";
      return res.status(409).json({
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} đã tồn tại`,
        field,
      });
    }

    // Foreign key constraint violation
    if (err.code === "P2003") {
      return res.status(400).json({
        message: "Tham chiếu tới tài nguyên liên quan không hợp lệ",
        field: err.meta?.field_name,
      });
    }

    // Record not found
    if (err.code === "P2025") {
      return res.status(404).json({
        message: "Không tìm thấy tài nguyên",
      });
    }

    // Record to delete does not exist
    if (err.code === "P2016") {
      return res.status(404).json({
        message: "Không tìm thấy tài nguyên",
      });
    }
  }

  // Handle Prisma validation errors (invalid UUID, etc.)
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: "Định dạng dữ liệu hoặc tham số không hợp lệ",
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
    err.message.includes("Không tìm thấy") ||
    err.message.includes("không tìm thấy")
  ) {
    return res.status(404).json({ message: err.message });
  }

  if (err.message.includes("đã tồn tại")) {
    return res.status(409).json({ message: err.message });
  }

  if (
    err.message.includes("Invalid credentials") ||
    err.message.includes("Invalid token")
  ) {
    return res.status(401).json({ message: err.message });
  }

  if (
    err.message.includes("không đúng") ||
    err.message.includes("chưa được xác thực") ||
    err.message.includes("chưa được kích hoạt") ||
    err.message.includes("Token không hợp lệ") ||
    err.message.includes("Yêu cầu đăng nhập")
  ) {
    return res.status(401).json({ message: err.message });
  }

  if (err.message.includes("Validation failed")) {
    return res.status(400).json({ message: err.message });
  }

  if (
    err.message.includes("không hợp lệ") ||
    err.message.includes("hết hạn") ||
    err.message.includes("Thiếu mã xác thực")
  ) {
    return res.status(400).json({ message: err.message });
  }

  if (
    err.message.includes("cloudinary") ||
    err.message.includes("Cloudinary") ||
    err.message.includes("Tải ảnh lên thất bại")
  ) {
    return res.status(502).json({
      message: "Dịch vụ xử lý ảnh tạm thời không khả dụng",
    });
  }

  // Default server error
  return res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Lỗi máy chủ nội bộ"
        : err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
