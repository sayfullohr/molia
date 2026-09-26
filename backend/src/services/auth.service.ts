import { prisma } from '../config/prisma';
import {
  hashPassword,
  comparePassword,
  normalizeUsername,
  validateUsername,
  validatePasswordComplexity,
} from '../utils/password';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';
import { parseDeviceInfo } from '../utils/device';
import { gamificationService } from './gamification.service';
import { config } from '../config/env';

export class AuthService {
  public async register(
    usernameInput: string,
    passwordInput: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const usernameValidation = validateUsername(usernameInput);
    if (!usernameValidation.valid) {
      throw new BadRequestError(usernameValidation.error);
    }

    const passwordValidation = validatePasswordComplexity(passwordInput);
    if (!passwordValidation.valid) {
      throw new BadRequestError(passwordValidation.error);
    }

    const normalized = normalizeUsername(usernameInput);

    // Check case-insensitive uniqueness
    const existing = await prisma.user.findFirst({
      where: {
        username: {
          equals: normalized,
        },
      },
    });

    if (existing) {
      throw new ConflictError('Ushbu foydalanuvchi nomi allaqachon ro‘yxatdan o‘tgan');
    }

    const passwordHash = await hashPassword(passwordInput);

    // Create user
    const user = await prisma.user.create({
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
    await gamificationService.recordDailyActivity(user.id);

    // Create session
    const session = await this.createSession(user.id, ipAddress, userAgent);

    // Log successful attempt
    const device = parseDeviceInfo(userAgent);
    await prisma.loginAttempt.create({
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

  public async login(
    usernameInput: string,
    passwordInput: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const normalized = normalizeUsername(usernameInput);
    const device = parseDeviceInfo(userAgent);

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: normalized,
        },
      },
    });

    if (!user) {
      // Record failed attempt
      await prisma.loginAttempt.create({
        data: {
          username: normalized,
          userId: null,
          success: false,
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'Noma’lum',
          deviceInfo: device.summary,
        },
      });
      throw new BadRequestError('Foydalanuvchi nomi yoki parol noto‘g‘ri.');
    }

    const isMatch = await comparePassword(passwordInput, user.passwordHash);
    if (!isMatch) {
      await prisma.loginAttempt.create({
        data: {
          username: normalized,
          userId: user.id,
          success: false,
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'Noma’lum',
          deviceInfo: device.summary,
        },
      });
      throw new BadRequestError('Foydalanuvchi nomi yoki parol noto‘g‘ri.');
    }

    // Record successful login attempt
    await prisma.loginAttempt.create({
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
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'LOGIN',
        title: 'Qurilmadan kirish qayd etildi',
        message: `${device.summary} qurilmasidan yangi sessiya ochildi (${ipAddress || '127.0.0.1'}).`,
      },
    });

    // Record streak & daily login XP
    await gamificationService.recordDailyActivity(user.id);

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

  public async logout(sessionId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  public async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Foydalanuvchi topilmadi');
    }

    const gamification = await gamificationService.getUserStats(userId);
    const unreadNotifications = await prisma.notification.count({
      where: { userId, read: false },
    });

    return {
      ...user,
      stats: gamification,
      unreadNotifications,
    };
  }

  private async createSession(userId: string, ipAddress?: string, userAgent?: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.sessionDurationDays);

    const device = parseDeviceInfo(userAgent);

    return prisma.session.create({
      data: {
        userId,
        expiresAt,
        ipAddress: ipAddress || '127.0.0.1',
        deviceInfo: device.summary,
      },
    });
  }
}

export const authService = new AuthService();
