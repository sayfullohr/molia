import { Router } from 'express';
import authRoutes from './auth.routes';
import transactionRoutes from './transaction.routes';
import { categoryRouter, budgetRouter, statisticsRouter } from './finance.routes';
import { friendRouter, messageRouter } from './social.routes';
import gameRoutes from './game.routes';
import {
  gamificationRouter,
  notificationRouter,
  securityRouter,
  exportRouter,
} from './system.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/transactions', transactionRoutes);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/budget', budgetRouter);
apiRouter.use('/statistics', statisticsRouter);
apiRouter.use('/friends', friendRouter);
apiRouter.use('/messages', messageRouter);
apiRouter.use('/games', gameRoutes);
apiRouter.use('/gamification', gamificationRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/security', securityRouter);
apiRouter.use('/export', exportRouter);

export default apiRouter;
