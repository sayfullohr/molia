import { Request, Response, NextFunction } from 'express';
import { friendService } from '../services/friend.service';
import { chatService } from '../services/chat.service';

export class SocialController {
  // Friends
  public async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      const users = await friendService.searchUsers(req.userId!, query);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  public async getFriends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const friends = await friendService.getFriends(req.userId!);
      res.json({ success: true, data: friends });
    } catch (error) {
      next(error);
    }
  }

  public async getOnlineUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await friendService.getOnlineUsers(req.userId!);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public async sendRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username } = req.body;
      const request = await friendService.sendRequest(req.userId!, username);
      res.status(201).json({
        success: true,
        message: 'Do‘stlik so‘rovi yuborildi',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  public async respondRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { action } = req.body;
      const result = await friendService.respondToRequest(req.userId!, id, action);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async removeFriend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await friendService.removeFriend(req.userId!, id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async getPendingRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requests = await friendService.getPendingRequests(req.userId!);
      res.json({ success: true, data: requests });
    } catch (error) {
      next(error);
    }
  }

  // Chat
  public async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const messages = await chatService.getMessages(req.userId!, userId);
      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  }

  public async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { receiverId, message } = req.body;
      const created = await chatService.sendMessage(req.userId!, receiverId, message);
      res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const convs = await chatService.getConversations(req.userId!);
      res.json({ success: true, data: convs });
    } catch (error) {
      next(error);
    }
  }
}

export const socialController = new SocialController();
