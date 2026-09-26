export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Noto‘g‘ri ma’lumot kiritildi') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Foydalanuvchi tizimga kirmagan yoki sessiya muddati tugagan') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Ushbu amalni bajarish uchun ruxsat yo‘q') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Ma’lumot topilmadi') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Ushbu ma’lumot allaqachon mavjud') {
    super(message, 409);
  }
}
