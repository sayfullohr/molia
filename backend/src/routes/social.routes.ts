import { Router } from 'express';
import { socialController } from '../controllers/social.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { friendRequestSchema, friendResponseSchema, sendMessageSchema } from '../validators/common.validator';

export const friendRouter = Router();
friendRouter.use(requireAuth);
friendRouter.get('/', (req, res, next) => socialController.getFriends(req, res, next));
friendRouter.get('/online', (req, res, next) => socialController.getOnlineUsers(req, res, next));
friendRouter.get('/search', (req, res, next) => socialController.searchUsers(req, res, next));
friendRouter.get('/requests', (req, res, next) => socialController.getPendingRequests(req, res, next));
friendRouter.post('/request', validate(friendRequestSchema), (req, res, next) => socialController.sendRequest(req, res, next));
friendRouter.patch('/request/:id', validate(friendResponseSchema), (req, res, next) => socialController.respondRequest(req, res, next));
friendRouter.delete('/:id', (req, res, next) => socialController.removeFriend(req, res, next));

export const messageRouter = Router();
messageRouter.use(requireAuth);
messageRouter.get('/conversations', (req, res, next) => socialController.getConversations(req, res, next));
messageRouter.get('/:userId', (req, res, next) => socialController.getMessages(req, res, next));
messageRouter.post('/', validate(sendMessageSchema), (req, res, next) => socialController.sendMessage(req, res, next));
