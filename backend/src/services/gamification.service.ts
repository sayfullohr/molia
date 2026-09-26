import { prisma } from '../config/prisma';

// Level thresholds
// Level 1: 0 - 99
// Level 2: 100 - 249
// Level 3: 250 - 499
// Level 4: 500 - 899
// Level 5: 900 - 1399
// Level 6: 1400 - 1999
// Level 7: 2000 - 2699
export function calculateLevel(totalXP: number): {
  level: number;
  currentLevelMinXP: number;
  nextLevelXP: number;
  progressPercent: number;
} {
  const thresholds = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000, 6500, 8500, 11000];

  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (totalXP >= thresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const currentLevelMinXP = thresholds[level - 1] || 0;
  const nextLevelXP = thresholds[level] || currentLevelMinXP + 1000;
  const range = nextLevelXP - currentLevelMinXP;
  const progressInLevel = Math.max(0, totalXP - currentLevelMinXP);
  const progressPercent = Math.min(100, Math.round((progressInLevel / range) * 100));

  return {
    level,
    currentLevelMinXP,
    nextLevelXP,
    progressPercent,
  };
}

export class GamificationService {
  /**
   * Adds XP record for a user and checks level ups / achievements
   */
  public async addXP(userId: string, amount: number, reason: string): Promise<{ newTotalXP: number; levelUp: boolean; newLevel: number }> {
    const prevXPRecords = await prisma.xP.findMany({
      where: { userId },
      select: { amount: true },
    });
    const oldTotal = prevXPRecords.reduce((sum, r) => sum + r.amount, 0);
    const oldLevel = calculateLevel(oldTotal).level;

    await prisma.xP.create({
      data: {
        userId,
        amount,
        reason,
      },
    });

    const newTotal = oldTotal + amount;
    const { level: newLevel } = calculateLevel(newTotal);
    const levelUp = newLevel > oldLevel;

    if (levelUp) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'LEVEL_UP',
          title: '🎉 Level Up! Yangi daraja!',
          message: `Tabriklaymiz! Siz ${newLevel}-darajaga ko‘tarildingiz!`,
        },
      });

      if (newLevel >= 5) {
        await this.checkAndUnlockAchievement(userId, 'LEVEL_5');
      }
    }

    return { newTotalXP: newTotal, levelUp, newLevel };
  }

  /**
   * Updates user daily streak and awards daily login XP
   */
  public async recordDailyActivity(userId: string): Promise<{ streakCount: number; awardedXP: boolean }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingStreak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!existingStreak) {
      await prisma.streak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
        },
      });
      await this.addXP(userId, 10, 'Kunlik kirish mukofoti (+10 XP)');
      return { streakCount: 1, awardedXP: true };
    }

    if (!existingStreak.lastActiveDate) {
      await prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          longestStreak: Math.max(1, existingStreak.longestStreak),
          lastActiveDate: today,
        },
      });
      await this.addXP(userId, 10, 'Kunlik kirish mukofoti (+10 XP)');
      return { streakCount: 1, awardedXP: true };
    }

    const lastDate = new Date(existingStreak.lastActiveDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already active today
      return { streakCount: existingStreak.currentStreak, awardedXP: false };
    } else if (diffDays === 1) {
      // Consecutive day!
      const newStreak = existingStreak.currentStreak + 1;
      const newLongest = Math.max(newStreak, existingStreak.longestStreak);

      await prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActiveDate: today,
        },
      });

      await this.addXP(userId, 10, 'Kunlik faollik zanjiri (+10 XP)');

      if (newStreak >= 7) {
        await this.checkAndUnlockAchievement(userId, 'STREAK_7');
      }

      return { streakCount: newStreak, awardedXP: true };
    } else {
      // Streak broken, reset to 1
      await prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          lastActiveDate: today,
        },
      });
      await this.addXP(userId, 10, 'Kunlik faollik mukofoti (+10 XP)');
      return { streakCount: 1, awardedXP: true };
    }
  }

  /**
   * Checks and unlocks achievement safely
   */
  public async checkAndUnlockAchievement(userId: string, achievementCode: string): Promise<boolean> {
    const achievement = await prisma.achievement.findUnique({
      where: { code: achievementCode },
    });

    if (!achievement) return false;

    const existingUserAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (existingUserAchievement) return false; // Already unlocked

    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
      },
    });

    // Award XP
    await this.addXP(userId, achievement.xpReward, `🏆 Yutuq ochildi: ${achievement.name}`);

    // Create Notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'ACHIEVEMENT',
        title: `🏆 Yutuq: ${achievement.name}`,
        message: `${achievement.description} (+${achievement.xpReward} XP)`,
      },
    });

    return true;
  }

  /**
   * Gets user profile gamification stats (XP, level, streak, achievements)
   */
  public async getUserStats(userId: string) {
    const xpRecords = await prisma.xP.findMany({
      where: { userId },
      select: { amount: true },
    });
    const totalXP = xpRecords.reduce((sum, r) => sum + r.amount, 0);
    const levelInfo = calculateLevel(totalXP);

    const streak = await prisma.streak.findUnique({
      where: { userId },
    });

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });

    const allAchievements = await prisma.achievement.findMany();

    const gamesPlayedCount = await prisma.gameSession.count({
      where: {
        OR: [{ player1Id: userId }, { player2Id: userId }],
        status: { in: ['COMPLETED', 'DRAW'] },
      },
    });

    const gamesWonCount = await prisma.gameSession.count({
      where: { winnerId: userId },
    });

    return {
      totalXP,
      ...levelInfo,
      streak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      achievementsCount: userAchievements.length,
      totalAchievements: allAchievements.length,
      unlockedAchievements: userAchievements.map((ua) => ({
        id: ua.achievement.id,
        code: ua.achievement.code,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        unlockedAt: ua.unlockedAt,
        xpReward: ua.achievement.xpReward,
      })),
      allAchievements: allAchievements.map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        description: a.description,
        icon: a.icon,
        requirement: a.requirement,
        xpReward: a.xpReward,
        unlocked: userAchievements.some((ua) => ua.achievementId === a.id),
      })),
      gamesPlayedCount,
      gamesWonCount,
    };
  }

  /**
   * Leaderboard calculation (Global, Friends, All-time / Weekly)
   */
  public async getLeaderboard(userId: string, filter: 'global' | 'friends' = 'global') {
    let targetUserIds: string[] | undefined = undefined;

    if (filter === 'friends') {
      const friends = await prisma.friend.findMany({
        where: { userId },
        select: { friendId: true },
      });
      targetUserIds = [userId, ...friends.map((f) => f.friendId)];
    }

    const users = await prisma.user.findMany({
      where: targetUserIds ? { id: { in: targetUserIds } } : undefined,
      select: {
        id: true,
        username: true,
        xpRecords: {
          select: { amount: true },
        },
        streak: {
          select: { currentStreak: true },
        },
      },
    });

    const ranked = users
      .map((u) => {
        const totalXP = u.xpRecords.reduce((sum, r) => sum + r.amount, 0);
        const { level } = calculateLevel(totalXP);
        return {
          userId: u.id,
          username: u.username,
          totalXP,
          level,
          streak: u.streak?.currentStreak || 0,
          isCurrentUser: u.id === userId,
        };
      })
      .sort((a, b) => b.totalXP - a.totalXP)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

    return ranked;
  }
}

export const gamificationService = new GamificationService();
