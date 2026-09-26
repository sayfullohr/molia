import { prisma } from '../config/prisma';
import { NotFoundError } from '../utils/errors';

export class NotificationService {
  public async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  public async markAsRead(userId: string, notificationId: string) {
    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif || notif.userId !== userId) {
      throw new NotFoundError('Bildirishnoma topilmadi');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  public async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}

export class SecurityService {
  /**
   * Retrieves security audit log and login attempts (Strictly NO password or passwordHash)
   */
  public async getLoginHistory(userId?: string) {
    // If admin view or user view
    const attempts = await prisma.loginAttempt.findMany({
      where: userId ? { userId } : undefined,
      select: {
        id: true,
        username: true,
        success: true,
        ipAddress: true,
        userAgent: true,
        deviceInfo: true,
        createdAt: true,
        // Absolutely NO password or passwordHash
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return attempts;
  }

  /**
   * Retrieves active active sessions (Strictly NO secret tokens)
   */
  public async getActiveSessions(userId: string) {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }

  /**
   * Revoke specific session
   */
  public async revokeSession(userId: string, sessionId: string) {
    return prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() },
    });
  }
}

export const notificationService = new NotificationService();
export const securityService = new SecurityService();
