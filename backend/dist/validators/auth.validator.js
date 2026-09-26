"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const password_1 = require("../utils/password");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        username: zod_1.z
            .string()
            .min(3, 'Foydalanuvchi nomi kamida 3 belgidan iborat bo‘lishi kerak')
            .max(20, 'Foydalanuvchi nomi ko‘pi bilan 20 belgidan iborat bo‘lishi kerak')
            .regex(/^[a-zA-Z0-9_]+$/, 'Foydalanuvchi nomida faqat harflar, raqamlar va pastki chiziq (_) bo‘lishi mumkin')
            .refine((val) => !password_1.RESERVED_USERNAMES.has(val.trim().toLowerCase()), {
            message: 'Ushbu foydalanuvchi nomi tizim tomonidan band qilingan',
        }),
        password: zod_1.z
            .string()
            .min(8, 'Parol kamida 8 belgidan iborat bo‘lishi kerak')
            .regex(/[A-Z]/, 'Parolda kamida bitta katta harf (A-Z) bo‘lishi kerak')
            .regex(/[a-z]/, 'Parolda kamida bitta kichik harf (a-z) bo‘lishi kerak')
            .regex(/[0-9]/, 'Parolda kamida bitta raqam (0-9) bo‘lishi kerak')
            .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/, 'Parolda kamida bitta maxsus belgi bo‘lishi kerak'),
        confirmPassword: zod_1.z.string(),
    })
        .refine((data) => data.password === data.confirmPassword, {
        message: 'Kiritilgan parollar bir-biriga mos kelmadi',
        path: ['confirmPassword'],
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string().min(1, 'Foydalanuvchi nomini kiriting'),
        password: zod_1.z.string().min(1, 'Parolni kiriting'),
    }),
});
