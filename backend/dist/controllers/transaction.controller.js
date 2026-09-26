"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionController = exports.TransactionController = void 0;
const transaction_service_1 = require("../services/transaction.service");
class TransactionController {
    async getTransactions(req, res, next) {
        try {
            const { search, categoryId, type, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder, page, limit, } = req.query;
            const result = await transaction_service_1.transactionService.getTransactions(req.userId, {
                search,
                categoryId,
                type,
                startDate,
                endDate,
                minAmount: minAmount ? parseFloat(minAmount) : undefined,
                maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
                sortBy,
                sortOrder,
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getDashboard(req, res, next) {
        try {
            const summary = await transaction_service_1.transactionService.getDashboardSummary(req.userId);
            res.json({
                success: true,
                data: summary,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const { type, amount, categoryId, title, description, date } = req.body;
            const transaction = await transaction_service_1.transactionService.createTransaction(req.userId, {
                type,
                amount,
                categoryId,
                title,
                description,
                date: date ? new Date(date) : undefined,
            });
            res.status(201).json({
                success: true,
                message: 'Tranzaksiya muvaffaqiyatli saqlandi',
                data: transaction,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async smartParse(req, res, next) {
        try {
            const { text } = req.body;
            if (!text || typeof text !== 'string') {
                res.status(400).json({ success: false, message: 'Matn kiritilishi shart' });
                return;
            }
            const result = await transaction_service_1.transactionService.parseAndCreateFromText(req.userId, text);
            res.status(201).json({
                success: true,
                message: 'Matn tahlil qilinib, xarajat saqlandi',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const { type, amount, categoryId, title, description, date } = req.body;
            const updated = await transaction_service_1.transactionService.updateTransaction(req.userId, id, {
                type,
                amount,
                categoryId,
                title,
                description,
                date: date ? new Date(date) : undefined,
            });
            res.json({
                success: true,
                message: 'Tranzaksiya muvaffaqiyatli tahrirlandi',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async remove(req, res, next) {
        try {
            const id = req.params.id;
            const result = await transaction_service_1.transactionService.deleteTransaction(req.userId, id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TransactionController = TransactionController;
exports.transactionController = new TransactionController();
