import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionSchema,
} from '../validators/transaction.validator';

const router = Router();

router.use(requireAuth);

router.get('/', validate(queryTransactionSchema), (req, res, next) =>
  transactionController.getTransactions(req, res, next)
);

router.get('/dashboard', (req, res, next) =>
  transactionController.getDashboard(req, res, next)
);

router.post('/', validate(createTransactionSchema), (req, res, next) =>
  transactionController.create(req, res, next)
);

router.post('/smart-parse', (req, res, next) =>
  transactionController.smartParse(req, res, next)
);

router.patch('/:id', validate(updateTransactionSchema), (req, res, next) =>
  transactionController.update(req, res, next)
);

router.delete('/:id', (req, res, next) =>
  transactionController.remove(req, res, next)
);

export default router;
