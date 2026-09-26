"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameController = exports.GameController = void 0;
const game_service_1 = require("../services/game.service");
class GameController {
    async createGame(req, res, next) {
        try {
            const { gameType, opponentId } = req.body;
            const game = await game_service_1.gameService.createGame(req.userId, gameType, opponentId);
            res.status(201).json({
                success: true,
                data: game,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async joinGame(req, res, next) {
        try {
            const id = req.params.id;
            const game = await game_service_1.gameService.joinGame(id, req.userId);
            res.json({
                success: true,
                data: game,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getGame(req, res, next) {
        try {
            const id = req.params.id;
            const game = await game_service_1.gameService.getGame(id);
            res.json({
                success: true,
                data: game,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async makeMove(req, res, next) {
        try {
            const id = req.params.id;
            const { moveData } = req.body;
            const updated = await game_service_1.gameService.makeMove(id, req.userId, moveData);
            res.json({
                success: true,
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async rematch(req, res, next) {
        try {
            const id = req.params.id;
            const newGame = await game_service_1.gameService.rematch(id, req.userId);
            res.status(201).json({
                success: true,
                data: newGame,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async heartbeat(req, res, next) {
        try {
            game_service_1.GameService.recordHeartbeat(req.userId);
            res.json({
                success: true,
                activePlayersCount: game_service_1.GameService.getActiveGameUserIds().length,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getPendingInvite(req, res, next) {
        try {
            const invite = await game_service_1.gameService.getPendingInvite(req.userId);
            res.json({
                success: true,
                data: invite,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.GameController = GameController;
exports.gameController = new GameController();
