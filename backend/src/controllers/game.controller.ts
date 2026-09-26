import { Request, Response, NextFunction } from 'express';
import { gameService, GameService } from '../services/game.service';

export class GameController {
  public async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gameType, opponentId } = req.body;
      const game = await gameService.createGame(req.userId!, gameType, opponentId);
      res.status(201).json({
        success: true,
        data: game,
      });
    } catch (error) {
      next(error);
    }
  }

  public async joinGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const game = await gameService.joinGame(id, req.userId!);
      res.json({
        success: true,
        data: game,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const game = await gameService.getGame(id);
      res.json({
        success: true,
        data: game,
      });
    } catch (error) {
      next(error);
    }
  }

  public async makeMove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { moveData } = req.body;
      const updated = await gameService.makeMove(id, req.userId!, moveData);
      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  public async rematch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const newGame = await gameService.rematch(id, req.userId!);
      res.status(201).json({
        success: true,
        data: newGame,
      });
    } catch (error) {
      next(error);
    }
  }

  public async heartbeat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      GameService.recordHeartbeat(req.userId!);
      res.json({
        success: true,
        activePlayersCount: GameService.getActiveGameUserIds().length,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getPendingInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invite = await gameService.getPendingInvite(req.userId!);
      res.json({
        success: true,
        data: invite,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const gameController = new GameController();
