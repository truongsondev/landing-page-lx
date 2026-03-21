// Custom error classes for better error handling
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Không tìm thấy tài nguyên") {
    super(404, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Dữ liệu không hợp lệ") {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Không được phép truy cập") {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Không đủ quyền truy cập") {
    super(403, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Tài nguyên đã tồn tại") {
    super(409, message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Yêu cầu không hợp lệ") {
    super(400, message);
  }
}
