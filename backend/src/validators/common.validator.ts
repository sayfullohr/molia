import { z } from 'zod';

export const setBudgetSchema = z.object({
  body: z.object({
    amount: z.number().positive('Byudjet miqdori noldan katta bo‘lishi kerak'),
    month: z.number().int().min(1).max(12, 'Oy 1 dan 12 gacha bo‘lishi kerak'),
    year: z.number().int().min(2020).max(2100, 'Yil yaroqsiz'),
  }),
});

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Kategoriya nomi kiritilishi shart').max(50),
    icon: z.string().min(1, 'Belgi kiritilishi shart').max(30),
    type: z.enum(['EXPENSE', 'INCOME'], {
      errorMap: () => ({ message: 'Turi EXPENSE yoki INCOME bo‘lishi kerak' }),
    }),
  }),
});

export const friendRequestSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Foydalanuvchi nomini kiriting'),
  }),
});

export const friendResponseSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    action: z.enum(['ACCEPT', 'REJECT'], {
      errorMap: () => ({ message: 'Amal ACCEPT yoki REJECT bo‘lishi kerak' }),
    }),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().uuid('Qabul qiluvchi identifikatori yaroqsiz'),
    message: z.string().min(1, 'Xabar bo‘sh bo‘lishi mumkin emas').max(1000, 'Xabar ko‘pi bilan 1000 belgi bo‘lishi mumkin'),
  }),
});

export const createGameSchema = z.object({
  body: z.object({
    gameType: z.enum(['TIC_TAC_TOE', 'QUIZ', 'CHECKERS'], {
      errorMap: () => ({ message: 'O‘yin turi: TIC_TAC_TOE, QUIZ yoki CHECKERS' }),
    }),
    opponentId: z.string().uuid().optional().nullable(),
  }),
});

export const gameMoveSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    moveData: z.record(z.any()),
  }),
});
