import { Request, Response, NextFunction } from 'express';

// Rate limit cheklovlarini to'liq olib tashlash (erkin foydalanish uchun)
export const generalLimiter = (req: Request, res: Response, next: NextFunction) => {
  next();
};

export const authLimiter = (req: Request, res: Response, next: NextFunction) => {
  next();
};
