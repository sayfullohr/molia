import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { UnauthorizedError } from '../utils/errors';
import { config } from '../config/env';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      sessionId?: string;
      user?: {
        id: string;
        username: string;
      };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let sessionId: string | undefined = req.cookies?.[config.sessionCookieName];

    // Also support Authorization header for flexibility
    if (!sessionId && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        sessionId = parts[1];
      }
    }

    if (!sessionId) {
      throw new UnauthorizedError('Tizimga kirish talab qilinadi');
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedError('Sessiya topilmadi');
    }

    if (session.revokedAt) {
      throw new UnauthorizedError('Sessiya bekor qilingan');
    }

    if (new Date() > session.expiresAt) {
      throw new UnauthorizedError('Sessiya muddati tugagan');
    }

    req.userId = session.userId;
    req.sessionId = session.id;
    req.user = session.user;

    next();
  } catch (error) {
    next(error);
  }
}
