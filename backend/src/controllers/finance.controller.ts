import { Request, Response, NextFunction } from 'express';
import { categoryService, budgetService, statisticsService } from '../services/finance.service';

export class FinanceController {
  // Categories
  public async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.getCategories(req.userId!);
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  public async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, icon, type } = req.body;
      const category = await categoryService.createCategory(req.userId!, { name, icon, type });
      res.status(201).json({
        success: true,
        message: 'Kategoriya yaratildi',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await categoryService.deleteCategory(req.userId!, id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Budget
  public async getBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const now = new Date();
      const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();

      const result = await budgetService.getBudget(req.userId!, month, year);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public async setBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, month, year } = req.body;
      const budget = await budgetService.setBudget(req.userId!, amount, month, year);
      res.json({
        success: true,
        message: 'Oylik byudjet belgilandi',
        data: budget,
      });
    } catch (error) {
      next(error);
    }
  }

  // Statistics
  public async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = (req.query.period as any) || 'monthly';
      const stats = await statisticsService.getStatistics(req.userId!, period);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

export const financeController = new FinanceController();
