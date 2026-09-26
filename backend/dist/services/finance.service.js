"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statisticsService = exports.budgetService = exports.categoryService = exports.StatisticsService = exports.BudgetService = exports.CategoryService = void 0;
const prisma_1 = require("../config/prisma");
const errors_1 = require("../utils/errors");
class CategoryService {
    async getCategories(userId) {
        // Return system categories (userId: null) AND user custom categories
        return prisma_1.prisma.category.findMany({
            where: {
                OR: [{ userId: null }, { userId }],
            },
            orderBy: { name: 'asc' },
        });
    }
    async createCategory(userId, data) {
        const existing = await prisma_1.prisma.category.findFirst({
            where: {
                name: data.name,
                OR: [{ userId: null }, { userId }],
            },
        });
        if (existing) {
            throw new errors_1.BadRequestError('Ushbu nomdagi kategoriya mavjud');
        }
        return prisma_1.prisma.category.create({
            data: {
                userId,
                name: data.name,
                icon: data.icon,
                type: data.type,
            },
        });
    }
    async deleteCategory(userId, id) {
        const category = await prisma_1.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            throw new errors_1.NotFoundError('Kategoriya topilmadi');
        }
        if (category.userId !== userId) {
            throw new errors_1.ForbiddenError('Tizim kategoriyalarini yoki boshqa foydalanuvchi kategoriyalarini o‘chirish mumkin emas');
        }
        await prisma_1.prisma.category.delete({
            where: { id },
        });
        return { success: true, message: 'Kategoriya muvaffaqiyatli o‘chirildi' };
    }
}
exports.CategoryService = CategoryService;
class BudgetService {
    async getBudget(userId, month, year) {
        const budget = await prisma_1.prisma.budget.findUnique({
            where: {
                userId_month_year: { userId, month, year },
            },
        });
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        const spentAgg = await prisma_1.prisma.transaction.aggregate({
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
    async setBudget(userId, amount, month, year) {
        return prisma_1.prisma.budget.upsert({
            where: {
                userId_month_year: { userId, month, year },
            },
            update: { amount },
            create: { userId, amount, month, year },
        });
    }
}
exports.BudgetService = BudgetService;
class StatisticsService {
    async getStatistics(userId, period = 'monthly') {
        const now = new Date();
        let startDate;
        let endDate = new Date();
        if (period === 'daily') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        }
        else if (period === 'weekly') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        else if (period === 'yearly') {
            startDate = new Date(now.getFullYear(), 0, 1);
        }
        else {
            // Monthly default
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const transactions = await prisma_1.prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: startDate, lte: endDate },
            },
            include: { category: true },
            orderBy: { date: 'asc' },
        });
        let totalIncome = 0;
        let totalExpense = 0;
        const categoryTotals = {};
        const timelineData = {};
        for (const t of transactions) {
            if (t.type === 'INCOME') {
                totalIncome += t.amount;
            }
            else {
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
            }
            else {
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
exports.StatisticsService = StatisticsService;
exports.categoryService = new CategoryService();
exports.budgetService = new BudgetService();
exports.statisticsService = new StatisticsService();
