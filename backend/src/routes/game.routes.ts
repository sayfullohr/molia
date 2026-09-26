import { Router } from 'express';
import { gameController } from '../controllers/game.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createGameSchema, gameMoveSchema } from '../validators/common.validator';

const router = Router();

router.use(requireAuth);

router.post('/heartbeat', (req, res, next) => gameController.heartbeat(req, res, next));
router.get('/pending-invite', (req, res, next) => gameController.getPendingInvite(req, res, next));
router.post('/', validate(createGameSchema), (req, res, next) => gameController.createGame(req, res, next));
router.get('/:id', (req, res, next) => gameController.getGame(req, res, next));
router.post('/:id/join', (req, res, next) => gameController.joinGame(req, res, next));
router.post('/:id/move', validate(gameMoveSchema), (req, res, next) => gameController.makeMove(req, res, next));
router.post('/:id/rematch', (req, res, next) => gameController.rematch(req, res, next));

export default router;
