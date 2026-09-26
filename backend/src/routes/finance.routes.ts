import { Router } from 'express';
import { financeController } from '../controllers/finance.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { categorySchema, setBudgetSchema } from '../validators/common.validator';

export const categoryRouter = Router();
categoryRouter.use(requireAuth);
categoryRouter.get('/', (req, res, next) => financeController.getCategories(req, res, next));
categoryRouter.post('/', validate(categorySchema), (req, res, next) => financeController.createCategory(req, res, next));
categoryRouter.delete('/:id', (req, res, next) => financeController.deleteCategory(req, res, next));

export const budgetRouter = Router();
budgetRouter.use(requireAuth);
budgetRouter.get('/', (req, res, next) => financeController.getBudget(req, res, next));
budgetRouter.post('/', validate(setBudgetSchema), (req, res, next) => financeController.setBudget(req, res, next));
budgetRouter.patch('/', validate(setBudgetSchema), (req, res, next) => financeController.setBudget(req, res, next));

export const statisticsRouter = Router();
statisticsRouter.use(requireAuth);
statisticsRouter.get('/', (req, res, next) => financeController.getStatistics(req, res, next));
