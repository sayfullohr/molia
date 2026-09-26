import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['EXPENSE', 'INCOME'], {
      errorMap: () => ({ message: 'Tranzaksiya turi EXPENSE yoki INCOME bo‘lishi kerak' }),
    }),
    amount: z.number().positive('Summa noldan katta bo‘lishi kerak'),
    categoryId: z.string().optional().nullable(),
    title: z.string().min(1, 'Nom/sabab kiritilishi shart').max(100, 'Nom ko‘pi bilan 100 belgi bo‘lishi mumkin'),
    description: z.string().max(500, 'Izoh ko‘pi bilan 500 belgi bo‘lishi mumkin').optional().nullable(),
    date: z.string().datetime({ message: 'Noto‘g‘ri sana formati' }).optional(),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Tranzaksiya identifikatori yaroqsiz'),
  }),
  body: z.object({
    type: z.enum(['EXPENSE', 'INCOME']).optional(),
    amount: z.number().positive('Summa noldan katta bo‘lishi kerak').optional(),
    categoryId: z.string().optional().nullable(),
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional().nullable(),
    date: z.string().datetime().optional(),
  }),
});

export const queryTransactionSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    categoryId: z.string().optional(),
    type: z.enum(['EXPENSE', 'INCOME']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    minAmount: z.string().optional(),
    maxAmount: z.string().optional(),
    sortBy: z.enum(['date', 'amount', 'title']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
