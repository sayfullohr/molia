import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', authLimiter, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

router.post('/logout', requireAuth, (req, res, next) =>
  authController.logout(req, res, next)
);

router.get('/me', requireAuth, (req, res, next) =>
  authController.getMe(req, res, next)
);

export default router;
