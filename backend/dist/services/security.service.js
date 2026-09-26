"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityService = exports.notificationService = exports.SecurityService = exports.NotificationService = void 0;
const prisma_1 = require("../config/prisma");
const errors_1 = require("../utils/errors");
class NotificationService {
    async getNotifications(userId) {
        return prisma_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async markAsRead(userId, notificationId) {
        const notif = await prisma_1.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notif || notif.userId !== userId) {
            throw new errors_1.NotFoundError('Bildirishnoma topilmadi');
        }
        return prisma_1.prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
    }
    async markAllAsRead(userId) {
        return prisma_1.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }
}
exports.NotificationService = NotificationService;
class SecurityService {
    /**
     * Retrieves security audit log and login attempts (Strictly NO password or passwordHash)
     */
    async getLoginHistory(userId) {
        // If admin view or user view
        const attempts = await prisma_1.prisma.loginAttempt.findMany({
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
    async getActiveSessions(userId) {
        const sessions = await prisma_1.prisma.session.findMany({
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
    async revokeSession(userId, sessionId) {
        return prisma_1.prisma.session.updateMany({
            where: { id: sessionId, userId },
            data: { revokedAt: new Date() },
        });
    }
}
exports.SecurityService = SecurityService;
exports.notificationService = new NotificationService();
exports.securityService = new SecurityService();
