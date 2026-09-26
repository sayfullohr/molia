import { prisma } from '../config/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

export class CategoryService {
  public async getCategories(userId: string) {
    // Return system categories (userId: null) AND user custom categories
    return prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
      },
      orderBy: { name: 'asc' },
    });
  }

  public async createCategory(userId: string, data: { name: string; icon: string; type: string }) {
    const existing = await prisma.category.findFirst({
      where: {
        name: data.name,
        OR: [{ userId: null }, { userId }],
      },
    });

    if (existing) {
      throw new BadRequestError('Ushbu nomdagi kategoriya mavjud');
    }

    return prisma.category.create({
      data: {
        userId,
        name: data.name,
        icon: data.icon,
        type: data.type,
      },
    });
  }

  public async deleteCategory(userId: string, id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundError('Kategoriya topilmadi');
    }

    if (category.userId !== userId) {
      throw new ForbiddenError('Tizim kategoriyalarini yoki boshqa foydalanuvchi kategoriyalarini o‘chirish mumkin emas');
    }

    await prisma.category.delete({
      where: { id },
    });

    return { success: true, message: 'Kategoriya muvaffaqiyatli o‘chirildi' };
  }
}

export class BudgetService {
  public async getBudget(userId: string, month: number, year: number) {
    const budget = await prisma.budget.findUnique({
      where: {
        userId_month_year: { userId, month, year },
      },
    });

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const spentAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    const spent = spentAgg._sum.amount || 0;
    const budgetAmount = budget?.amount || 0;
    const remaining = Math.max(0, budgetAmount - spent);
    const percent = budgetAmount > 0 ? Math.min(100, Math.round((spent / budgetAmount) * 100)) : 0;

    const now = new Date();
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const currentDay = (now.getMonth() + 1 === month && now.getFullYear() === year) ? now.getDate() : 1;
    const remainingDays = Math.max(1, totalDaysInMonth - currentDay + 1);
    const smartDailyLimit = budgetAmount > 0 ? Math.round(remaining / remainingDays) : 0;

    return {
      budget: budget ? { id: budget.id, amount: budget.amount, month: budget.month, year: budget.year } : null,
      budgetAmount,
      spent,
      remaining,
      percent,
      remainingDays,
      smartDailyLimit,
      isWarning: percent >= 80 && percent < 100,
      isExceeded: percent >= 100,
    };
  }

  public async setBudget(userId: string, amount: number, month: number, year: number) {
    return prisma.budget.upsert({
      where: {
        userId_month_year: { userId, month, year },
      },
      update: { amount },
      create: { userId, amount, month, year },
    });
  }
}

export class StatisticsService {
  public async getStatistics(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (period === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      // Monthly default
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, { name: string; icon: string; amount: number; count: number }> = {};
    const timelineData: Record<string, { date: string; income: number; expense: number }> = {};

    for (const t of transactions) {
      if (t.type === 'INCOME') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
        const catKey = t.category?.name || 'Boshqa';
        const icon = t.category?.icon || '📦';
        if (!categoryTotals[catKey]) {
          categoryTotals[catKey] = { name: catKey, icon, amount: 0, count: 0 };
        }
        categoryTotals[catKey].amount += t.amount;
        categoryTotals[catKey].count += 1;
      }

      // Group timeline by date (YYYY-MM-DD)
      const dayKey = t.date.toISOString().split('T')[0];
      if (!timelineData[dayKey]) {
        timelineData[dayKey] = { date: dayKey, income: 0, expense: 0 };
      }
      if (t.type === 'INCOME') {
        timelineData[dayKey].income += t.amount;
      } else {
        timelineData[dayKey].expense += t.amount;
      }
    }

    // Category breakdown with percentages
    const categoryBreakdown = Object.values(categoryTotals)
      .map((cat) => ({
        ...cat,
        percentage: totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const topCategory = categoryBreakdown[0] || null;

    return {
      period,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryBreakdown,
      topCategory,
      timeline: Object.values(timelineData),
      transactionCount: transactions.length,
    };
  }
}

export const categoryService = new CategoryService();
export const budgetService = new BudgetService();
export const statisticsService = new StatisticsService();
