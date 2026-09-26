import { z } from 'zod';
import { RESERVED_USERNAMES } from '../utils/password';

export const registerSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .min(3, 'Foydalanuvchi nomi kamida 3 belgidan iborat bo‘lishi kerak')
        .max(20, 'Foydalanuvchi nomi ko‘pi bilan 20 belgidan iborat bo‘lishi kerak')
        .regex(/^[a-zA-Z0-9_]+$/, 'Foydalanuvchi nomida faqat harflar, raqamlar va pastki chiziq (_) bo‘lishi mumkin')
        .refine((val) => !RESERVED_USERNAMES.has(val.trim().toLowerCase()), {
          message: 'Ushbu foydalanuvchi nomi tizim tomonidan band qilingan',
        }),
      password: z
        .string()
        .min(8, 'Parol kamida 8 belgidan iborat bo‘lishi kerak')
        .regex(/[A-Z]/, 'Parolda kamida bitta katta harf (A-Z) bo‘lishi kerak')
        .regex(/[a-z]/, 'Parolda kamida bitta kichik harf (a-z) bo‘lishi kerak')
        .regex(/[0-9]/, 'Parolda kamida bitta raqam (0-9) bo‘lishi kerak')
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/, 'Parolda kamida bitta maxsus belgi bo‘lishi kerak'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Kiritilgan parollar bir-biriga mos kelmadi',
      path: ['confirmPassword'],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Foydalanuvchi nomini kiriting'),
    password: z.string().min(1, 'Parolni kiriting'),
  }),
});
