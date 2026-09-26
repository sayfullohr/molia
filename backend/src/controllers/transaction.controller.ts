import { Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service';

export class TransactionController {
  public async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        search,
        categoryId,
        type,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        sortBy,
        sortOrder,
        page,
        limit,
      } = req.query as any;

      const result = await transactionService.getTransactions(req.userId!, {
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
    } catch (error) {
      next(error);
    }
  }

  public async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await transactionService.getDashboardSummary(req.userId!);
      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, amount, categoryId, title, description, date } = req.body;
      const transaction = await transactionService.createTransaction(req.userId!, {
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
    } catch (error) {
      next(error);
    }
  }

  public async smartParse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ success: false, message: 'Matn kiritilishi shart' });
        return;
      }

      const result = await transactionService.parseAndCreateFromText(req.userId!, text);

      res.status(201).json({
        success: true,
        message: 'Matn tahlil qilinib, xarajat saqlandi',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { type, amount, categoryId, title, description, date } = req.body;

      const updated = await transactionService.updateTransaction(req.userId!, id, {
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
    } catch (error) {
      next(error);
    }
  }

  public async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await transactionService.deleteTransaction(req.userId!, id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
