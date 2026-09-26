"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameMoveSchema = exports.createGameSchema = exports.sendMessageSchema = exports.friendResponseSchema = exports.friendRequestSchema = exports.categorySchema = exports.setBudgetSchema = void 0;
const zod_1 = require("zod");
exports.setBudgetSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive('Byudjet miqdori noldan katta bo‘lishi kerak'),
        month: zod_1.z.number().int().min(1).max(12, 'Oy 1 dan 12 gacha bo‘lishi kerak'),
        year: zod_1.z.number().int().min(2020).max(2100, 'Yil yaroqsiz'),
    }),
});
exports.categorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Kategoriya nomi kiritilishi shart').max(50),
        icon: zod_1.z.string().min(1, 'Belgi kiritilishi shart').max(30),
        type: zod_1.z.enum(['EXPENSE', 'INCOME'], {
            errorMap: () => ({ message: 'Turi EXPENSE yoki INCOME bo‘lishi kerak' }),
        }),
    }),
});
exports.friendRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string().min(1, 'Foydalanuvchi nomini kiriting'),
    }),
});
exports.friendResponseSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        action: zod_1.z.enum(['ACCEPT', 'REJECT'], {
            errorMap: () => ({ message: 'Amal ACCEPT yoki REJECT bo‘lishi kerak' }),
        }),
    }),
});
exports.sendMessageSchema = zod_1.z.object({
    body: zod_1.z.object({
        receiverId: zod_1.z.string().uuid('Qabul qiluvchi identifikatori yaroqsiz'),
        message: zod_1.z.string().min(1, 'Xabar bo‘sh bo‘lishi mumkin emas').max(1000, 'Xabar ko‘pi bilan 1000 belgi bo‘lishi mumkin'),
    }),
});
exports.createGameSchema = zod_1.z.object({
    body: zod_1.z.object({
        gameType: zod_1.z.enum(['TIC_TAC_TOE', 'QUIZ', 'CHECKERS'], {
            errorMap: () => ({ message: 'O‘yin turi: TIC_TAC_TOE, QUIZ yoki CHECKERS' }),
        }),
        opponentId: zod_1.z.string().uuid().optional().nullable(),
    }),
});
exports.gameMoveSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        moveData: zod_1.z.record(zod_1.z.any()),
    }),
});
