import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    const errorMessages = err.errors.map((e) => e.message).join(', ');
    res.status(400).json({
      success: false,
      message: errorMessages || 'Kiritilgan ma’lumotlar yaroqsiz',
      errors: err.errors,
    });
    return;
  }

  // App operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Fallback for unexpected errors
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    message: 'Kutilmagan texnik nosozlik yuz berdi. Iltimos keyinroq qayta urinib ko‘ring.',
  });
}
