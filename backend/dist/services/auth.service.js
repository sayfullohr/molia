"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const prisma_1 = require("../config/prisma");
const password_1 = require("../utils/password");
const errors_1 = require("../utils/errors");
const device_1 = require("../utils/device");
const gamification_service_1 = require("./gamification.service");
const env_1 = require("../config/env");
class AuthService {
    async register(usernameInput, passwordInput, ipAddress, userAgent) {
        const usernameValidation = (0, password_1.validateUsername)(usernameInput);
        if (!usernameValidation.valid) {
            throw new errors_1.BadRequestError(usernameValidation.error);
        }
        const passwordValidation = (0, password_1.validatePasswordComplexity)(passwordInput);
        if (!passwordValidation.valid) {
            throw new errors_1.BadRequestError(passwordValidation.error);
        }
        const normalized = (0, password_1.normalizeUsername)(usernameInput);
        // Check case-insensitive uniqueness
        const existing = await prisma_1.prisma.user.findFirst({
            where: {
                username: {
                    equals: normalized,
                },
            },
        });
        if (existing) {
            throw new errors_1.ConflictError('Ushbu foydalanuvchi nomi allaqachon ro‘yxatdan o‘tgan');
        }
        const passwordHash = await (0, password_1.hashPassword)(passwordInput);
        // Create user
        const user = await prisma_1.prisma.user.create({
            data: {
                username: normalized,
                passwordHash,
            },
            select: {
                id: true,
                username: true,
                createdAt: true,
            },
        });
        // Create initial streak
        await gamification_service_1.gamificationService.recordDailyActivity(user.id);
        // Create session
        const session = await this.createSession(user.id, ipAddress, userAgent);
        // Log successful attempt
        const device = (0, device_1.parseDeviceInfo)(userAgent);
        await prisma_1.prisma.loginAttempt.create({
            data: {
                username: normalized,
                userId: user.id,
                success: true,
                ipAddress: ipAddress || '127.0.0.1',
                userAgent: userAgent || 'Noma’lum',
                deviceInfo: device.summary,
            },
        });
        return { user, sessionId: session.id, expiresAt: session.expiresAt };
    }
    async login(usernameInput, passwordInput, ipAddress, userAgent) {
        const normalized = (0, password_1.normalizeUsername)(usernameInput);
        const device = (0, device_1.parseDeviceInfo)(userAgent);
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                username: {
                    equals: normalized,
                },
            },
        });
        if (!user) {
            // Record failed attempt
            await prisma_1.prisma.loginAttempt.create({
                data: {
                    username: normalized,
                    userId: null,
                    success: false,
                    ipAddress: ipAddress || '127.0.0.1',
                    userAgent: userAgent || 'Noma’lum',
                    deviceInfo: device.summary,
                },
            });
            throw new errors_1.BadRequestError('Foydalanuvchi nomi yoki parol noto‘g‘ri.');
        }
        const isMatch = await (0, password_1.comparePassword)(passwordInput, user.passwordHash);
        if (!isMatch) {
            await prisma_1.prisma.loginAttempt.create({
                data: {
                    username: normalized,
                    userId: user.id,
                    success: false,
                    ipAddress: ipAddress || '127.0.0.1',
                    userAgent: userAgent || 'Noma’lum',
                    deviceInfo: device.summary,
                },
            });
            throw new errors_1.BadRequestError('Foydalanuvchi nomi yoki parol noto‘g‘ri.');
        }
        // Record successful login attempt
        await prisma_1.prisma.loginAttempt.create({
            data: {
                username: normalized,
                userId: user.id,
                success: true,
                ipAddress: ipAddress || '127.0.0.1',
                userAgent: userAgent || 'Noma’lum',
                deviceInfo: device.summary,
            },
        });
        // Notification for new login
        await prisma_1.prisma.notification.create({
            data: {
                userId: user.id,
                type: 'LOGIN',
                title: 'Qurilmadan kirish qayd etildi',
                message: `${device.summary} qurilmasidan yangi sessiya ochildi (${ipAddress || '127.0.0.1'}).`,
            },
        });
        // Record streak & daily login XP
        await gamification_service_1.gamificationService.recordDailyActivity(user.id);
        // Create session
        const session = await this.createSession(user.id, ipAddress, userAgent);
        return {
            user: {
                id: user.id,
                username: user.username,
                createdAt: user.createdAt,
            },
            sessionId: session.id,
            expiresAt: session.expiresAt,
        };
    }
    async logout(sessionId) {
        await prisma_1.prisma.session.updateMany({
            where: { id: sessionId },
            data: { revokedAt: new Date() },
        });
    }
    async getCurrentUser(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new errors_1.UnauthorizedError('Foydalanuvchi topilmadi');
        }
        const gamification = await gamification_service_1.gamificationService.getUserStats(userId);
        const unreadNotifications = await prisma_1.prisma.notification.count({
            where: { userId, read: false },
        });
        return {
            ...user,
            stats: gamification,
            unreadNotifications,
        };
    }
    async createSession(userId, ipAddress, userAgent) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + env_1.config.sessionDurationDays);
        const device = (0, device_1.parseDeviceInfo)(userAgent);
        return prisma_1.prisma.session.create({
            data: {
                userId,
                expiresAt,
                ipAddress: ipAddress || '127.0.0.1',
                deviceInfo: device.summary,
            },
        });
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
