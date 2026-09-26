import { Request, Response, NextFunction } from 'express';
import { gamificationService } from '../services/gamification.service';
import { notificationService, securityService } from '../services/security.service';
import { exportService } from '../services/export.service';

export class GamificationController {
  public async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await gamificationService.getUserStats(req.userId!);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  public async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter = (req.query.filter as any) || 'global';
      const leaderboard = await gamificationService.getLeaderboard(req.userId!, filter);
      res.json({ success: true, data: leaderboard });
    } catch (error) {
      next(error);
    }
  }
}

export class SecurityController {
  // Notifications
  public async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifs = await notificationService.getNotifications(req.userId!);
      res.json({ success: true, data: notifs });
    } catch (error) {
      next(error);
    }
  }

  public async markNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await notificationService.markAsRead(req.userId!, id);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  public async markAllNotificationsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markAllAsRead(req.userId!);
      res.json({ success: true, message: 'Barcha bildirishnomalar o‘qildi' });
    } catch (error) {
      next(error);
    }
  }

  // Security Monitoring & Sessions
  public async getLoginHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await securityService.getLoginHistory(req.userId!);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  public async getActiveSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessions = await securityService.getActiveSessions(req.userId!);
      res.json({ success: true, data: sessions });
    } catch (error) {
      next(error);
    }
  }

  public async revokeSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await securityService.revokeSession(req.userId!, id);
      res.json({ success: true, message: 'Sessiya bekor qilindi' });
    } catch (error) {
      next(error);
    }
  }

  // Exports
  public async exportCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const csv = await exportService.exportCSV(req.userId!);
      res.header('Content-Type', 'text/csv');
      res.attachment(`molia_transactions_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  public async exportExcel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buffer = await exportService.exportExcel(req.userId!);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=molia_transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

export const gamificationController = new GamificationController();
export const securityController = new SecurityController();
