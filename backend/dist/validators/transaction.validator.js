"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryTransactionSchema = exports.updateTransactionSchema = exports.createTransactionSchema = void 0;
const zod_1 = require("zod");
exports.createTransactionSchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum(['EXPENSE', 'INCOME'], {
            errorMap: () => ({ message: 'Tranzaksiya turi EXPENSE yoki INCOME bo‘lishi kerak' }),
        }),
        amount: zod_1.z.number().positive('Summa noldan katta bo‘lishi kerak'),
        categoryId: zod_1.z.string().optional().nullable(),
        title: zod_1.z.string().min(1, 'Nom/sabab kiritilishi shart').max(100, 'Nom ko‘pi bilan 100 belgi bo‘lishi mumkin'),
        description: zod_1.z.string().max(500, 'Izoh ko‘pi bilan 500 belgi bo‘lishi mumkin').optional().nullable(),
        date: zod_1.z.string().datetime({ message: 'Noto‘g‘ri sana formati' }).optional(),
    }),
});
exports.updateTransactionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Tranzaksiya identifikatori yaroqsiz'),
    }),
    body: zod_1.z.object({
        type: zod_1.z.enum(['EXPENSE', 'INCOME']).optional(),
        amount: zod_1.z.number().positive('Summa noldan katta bo‘lishi kerak').optional(),
        categoryId: zod_1.z.string().optional().nullable(),
        title: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().max(500).optional().nullable(),
        date: zod_1.z.string().datetime().optional(),
    }),
});
exports.queryTransactionSchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
        categoryId: zod_1.z.string().optional(),
        type: zod_1.z.enum(['EXPENSE', 'INCOME']).optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        minAmount: zod_1.z.string().optional(),
        maxAmount: zod_1.z.string().optional(),
        sortBy: zod_1.z.enum(['date', 'amount', 'title']).optional(),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
    }),
});
