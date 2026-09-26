"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = exports.TransactionService = void 0;
const prisma_1 = require("../config/prisma");
const errors_1 = require("../utils/errors");
const gamification_service_1 = require("./gamification.service");
const parser_1 = require("./smartParser/parser");
class TransactionService {
    /**
     * Creates a transaction with strict user isolation and checks budget thresholds + XP
     */
    async createTransaction(userId, data) {
        const transaction = await prisma_1.prisma.transaction.create({
            data: {
                userId,
                type: data.type,
                amount: data.amount,
                categoryId: data.categoryId || null,
                title: data.title,
                description: data.description || null,
                date: data.date || new Date(),
            },
            include: {
                category: true,
            },
        });
        // 1. Award +5 XP for adding a transaction
        await gamification_service_1.gamificationService.addXP(userId, 5, 'Tranzaksiya qo‘shildi (+5 XP)');
        // 2. Unlock First Transaction achievement
        await gamification_service_1.gamificationService.checkAndUnlockAchievement(userId, 'FIRST_TRANSACTION');
        // 3. Check budget alerts if it is an expense
        if (data.type === 'EXPENSE') {
            await this.checkBudgetAlerts(userId, data.date || new Date());
        }
        return transaction;
    }
    /**
     * Smart parse natural Uzbek text and save transaction
     */
    async parseAndCreateFromText(userId, text) {
        const parsed = parser_1.smartParser.parse(text);
        // Find category ID matching parsed categoryName
        const category = await prisma_1.prisma.category.findFirst({
            where: {
                name: parsed.categoryName,
                OR: [{ userId: null }, { userId }],
            },
        });
        const transaction = await this.createTransaction(userId, {
            type: parsed.type,
            amount: parsed.amount,
            categoryId: category?.id || null,
            title: parsed.title,
            description: parsed.rawText,
            date: parsed.date,
        });
        return {
            transaction,
            parsed,
            smartResponse: parsed.smartResponse,
        };
    }
    /**
     * Updates an existing transaction (strict ownership check)
     */
    async updateTransaction(userId, id, data) {
        const existing = await prisma_1.prisma.transaction.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new errors_1.NotFoundError('Tranzaksiya topilmadi');
        }
        if (existing.userId !== userId) {
            throw new errors_1.ForbiddenError('Ushbu tranzaksiyani o‘zgartirish uchun ruxsat yo‘q');
        }
        return prisma_1.prisma.transaction.update({
            where: { id },
            data: {
                ...(data.type && { type: data.type }),
                ...(data.amount !== undefined && { amount: data.amount }),
                ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
                ...(data.title && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.date && { date: data.date }),
            },
            include: {
                category: true,
            },
        });
    }
    /**
     * Deletes a transaction (strict ownership check)
     */
    async deleteTransaction(userId, id) {
        const existing = await prisma_1.prisma.transaction.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new errors_1.NotFoundError('Tranzaksiya topilmadi');
        }
        if (existing.userId !== userId) {
            throw new errors_1.ForbiddenError('Ushbu tranzaksiyani o‘chirish uchun ruxsat yo‘q');
        }
        await prisma_1.prisma.transaction.delete({
            where: { id },
        });
        return { success: true, message: 'Tranzaksiya muvaffaqiyatli o‘chirildi' };
    }
    /**
     * Filtered & paginated transactions query
     */
    async getTransactions(userId, params) {
        const { search, categoryId, type, startDate, endDate, minAmount, maxAmount, sortBy = 'date', sortOrder = 'desc', page = 1, limit = 20, } = params;
        const where = {
            userId, // STRICT ISOLATION
        };
        if (search) {
            where.title = {
                contains: search,
            };
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (type) {
            where.type = type;
        }
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
        }
        if (minAmount !== undefined || maxAmount !== undefined) {
            where.amount = {};
            if (minAmount !== undefined)
                where.amount.gte = minAmount;
            if (maxAmount !== undefined)
                where.amount.lte = maxAmount;
        }
        const skip = (page - 1) * limit;
        const [items, totalCount] = await Promise.all([
            prisma_1.prisma.transaction.findMany({
                where,
                include: {
                    category: true,
                },
                orderBy: {
                    [sortBy]: sortOrder,
                },
                skip,
                take: limit,
            }),
            prisma_1.prisma.transaction.count({ where }),
        ]);
        return {
            items,
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
        };
    }
    /**
     * Aggregates dashboard financial summary (Real calculation)
     */
    async getDashboardSummary(userId) {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        // All time totals for overall balance
        const [allIncome, allExpense] = await Promise.all([
            prisma_1.prisma.transaction.aggregate({
                where: { userId, type: 'INCOME' },
                _sum: { amount: true },
            }),
            prisma_1.prisma.transaction.aggregate({
                where: { userId, type: 'EXPENSE' },
                _sum: { amount: true },
            }),
        ]);
        const totalIncome = allIncome._sum.amount || 0;
        const totalExpense = allExpense._sum.amount || 0;
        const balance = totalIncome - totalExpense;
        // This month income & expense
        const [monthIncomeAgg, monthExpenseAgg, todayExpenseAgg] = await Promise.all([
            prisma_1.prisma.transaction.aggregate({
                where: {
                    userId,
                    type: 'INCOME',
                    date: { gte: startOfMonth, lte: endOfMonth },
                },
                _sum: { amount: true },
            }),
            prisma_1.prisma.transaction.aggregate({
                where: {
                    userId,
                    type: 'EXPENSE',
                    date: { gte: startOfMonth, lte: endOfMonth },
                },
                _sum: { amount: true },
            }),
            prisma_1.prisma.transaction.aggregate({
                where: {
                    userId,
                    type: 'EXPENSE',
                    date: { gte: startOfToday, lte: endOfToday },
                },
                _sum: { amount: true },
            }),
        ]);
        const monthIncome = monthIncomeAgg._sum.amount || 0;
        const monthExpense = monthExpenseAgg._sum.amount || 0;
        const todayExpense = todayExpenseAgg._sum.amount || 0;
        // Recent 5 transactions
        const recentTransactions = await prisma_1.prisma.transaction.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { date: 'desc' },
            take: 5,
        });
        // Budget information for current month
        const budget = await prisma_1.prisma.budget.findUnique({
            where: {
                userId_month_year: {
                    userId,
                    month: currentMonth,
                    year: currentYear,
                },
            },
        });
        let budgetSummary = null;
        if (budget) {
            const budgetAmount = budget.amount;
            const spent = monthExpense;
            const remaining = Math.max(0, budgetAmount - spent);
            const percent = Math.min(100, Math.round((spent / budgetAmount) * 100));
            // Calculate remaining days in month
            const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
            const currentDay = now.getDate();
            const remainingDays = Math.max(1, totalDaysInMonth - currentDay + 1);
            const smartDailyLimit = Math.round(remaining / remainingDays);
            budgetSummary = {
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
        return {
            balance,
            totalIncome,
            totalExpense,
            monthIncome,
            monthExpense,
            todayExpense,
            recentTransactions,
            budget: budgetSummary,
        };
    }
    /**
     * Checks budget thresholds and notifies user when crossing 80% and 100%
     */
    async checkBudgetAlerts(userId, date) {
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const budget = await prisma_1.prisma.budget.findUnique({
            where: {
                userId_month_year: { userId, month, year },
            },
        });
        if (!budget)
            return;
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
        const ratio = spent / budget.amount;
        if (ratio >= 1.0) {
            // Check if already notified for 100% this month
            const existing = await prisma_1.prisma.notification.findFirst({
                where: {
                    userId,
                    type: 'BUDGET_EXCEEDED',
                    createdAt: { gte: startOfMonth },
                },
            });
            if (!existing) {
                await prisma_1.prisma.notification.create({
                    data: {
                        userId,
                        type: 'BUDGET_EXCEEDED',
                        title: '🔴 Oylik byudjet tugadi',
                        message: `Siz bu oy belgilangan ${budget.amount.toLocaleString()} so‘m byudjetni to‘liq ishlatib bo‘ldingiz.`,
                    },
                });
            }
        }
        else if (ratio >= 0.8) {
            // Check if already notified for 80% this month
            const existing = await prisma_1.prisma.notification.findFirst({
                where: {
                    userId,
                    type: 'BUDGET_WARNING',
                    createdAt: { gte: startOfMonth },
                },
            });
            if (!existing) {
                await prisma_1.prisma.notification.create({
                    data: {
                        userId,
                        type: 'BUDGET_WARNING',
                        title: '⚠️ Byudjetning 80% ishlatildi',
                        message: `Bu oy belgilangan byudjetning 80% dan ortig‘i sarflandi. Tejamkorlikka e’tibor bering.`,
                    },
                });
            }
        }
    }
}
exports.TransactionService = TransactionService;
exports.transactionService = new TransactionService();
