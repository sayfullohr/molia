import { Router } from 'express';
import { gamificationController, securityController } from '../controllers/system.controller';
import { requireAuth } from '../middleware/auth';

export const gamificationRouter = Router();
gamificationRouter.use(requireAuth);
gamificationRouter.get('/stats', (req, res, next) => gamificationController.getStats(req, res, next));
gamificationRouter.get('/leaderboard', (req, res, next) => gamificationController.getLeaderboard(req, res, next));

export const notificationRouter = Router();
notificationRouter.use(requireAuth);
notificationRouter.get('/', (req, res, next) => securityController.getNotifications(req, res, next));
notificationRouter.patch('/:id/read', (req, res, next) => securityController.markNotificationRead(req, res, next));
notificationRouter.post('/read-all', (req, res, next) => securityController.markAllNotificationsRead(req, res, next));

export const securityRouter = Router();
securityRouter.use(requireAuth);
securityRouter.get('/login-history', (req, res, next) => securityController.getLoginHistory(req, res, next));
securityRouter.get('/sessions', (req, res, next) => securityController.getActiveSessions(req, res, next));
securityRouter.delete('/sessions/:id', (req, res, next) => securityController.revokeSession(req, res, next));

export const exportRouter = Router();
exportRouter.use(requireAuth);
exportRouter.get('/csv', (req, res, next) => securityController.exportCSV(req, res, next));
exportRouter.get('/excel', (req, res, next) => securityController.exportExcel(req, res, next));
