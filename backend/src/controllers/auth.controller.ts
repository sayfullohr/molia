import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { getClientIp } from '../utils/device';
import { config } from '../config/env';

export class AuthController {
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      const ip = getClientIp(req);
      const userAgent = req.headers['user-agent'];

      const result = await authService.register(username, password, ip, userAgent);

      res.cookie(config.sessionCookieName, result.sessionId, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        expires: result.expiresAt,
      });

      res.status(201).json({
        success: true,
        message: 'Ro‘yxatdan o‘tish muvaffaqiyatli amalga oshirildi',
        data: {
          user: result.user,
          token: result.sessionId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      const ip = getClientIp(req);
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(username, password, ip, userAgent);

      res.cookie(config.sessionCookieName, result.sessionId, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        expires: result.expiresAt,
      });

      res.json({
        success: true,
        message: 'Tizimga muvaffaqiyatli kirildi',
        data: {
          user: result.user,
          token: result.sessionId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.sessionId) {
        await authService.logout(req.sessionId);
      }

      res.clearCookie(config.sessionCookieName, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
      });

      res.json({
        success: true,
        message: 'Sessiya muvaffaqiyatli yakunlandi',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getCurrentUser(req.userId!);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
