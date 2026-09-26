"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeController = exports.FinanceController = void 0;
const finance_service_1 = require("../services/finance.service");
class FinanceController {
    // Categories
    async getCategories(req, res, next) {
        try {
            const categories = await finance_service_1.categoryService.getCategories(req.userId);
            res.json({ success: true, data: categories });
        }
        catch (error) {
            next(error);
        }
    }
    async createCategory(req, res, next) {
        try {
            const { name, icon, type } = req.body;
            const category = await finance_service_1.categoryService.createCategory(req.userId, { name, icon, type });
            res.status(201).json({
                success: true,
                message: 'Kategoriya yaratildi',
                data: category,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteCategory(req, res, next) {
        try {
            const id = req.params.id;
            const result = await finance_service_1.categoryService.deleteCategory(req.userId, id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // Budget
    async getBudget(req, res, next) {
        try {
            const now = new Date();
            const month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
            const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();
            const result = await finance_service_1.budgetService.getBudget(req.userId, month, year);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async setBudget(req, res, next) {
        try {
            const { amount, month, year } = req.body;
            const budget = await finance_service_1.budgetService.setBudget(req.userId, amount, month, year);
            res.json({
                success: true,
                message: 'Oylik byudjet belgilandi',
                data: budget,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Statistics
    async getStatistics(req, res, next) {
        try {
            const period = req.query.period || 'monthly';
            const stats = await finance_service_1.statisticsService.getStatistics(req.userId, period);
            res.json({ success: true, data: stats });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FinanceController = FinanceController;
exports.financeController = new FinanceController();
