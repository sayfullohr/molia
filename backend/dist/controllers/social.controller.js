"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialController = exports.SocialController = void 0;
const friend_service_1 = require("../services/friend.service");
const chat_service_1 = require("../services/chat.service");
class SocialController {
    // Friends
    async searchUsers(req, res, next) {
        try {
            const query = req.query.q || '';
            const users = await friend_service_1.friendService.searchUsers(req.userId, query);
            res.json({ success: true, data: users });
        }
        catch (error) {
            next(error);
        }
    }
    async getFriends(req, res, next) {
        try {
            const friends = await friend_service_1.friendService.getFriends(req.userId);
            res.json({ success: true, data: friends });
        }
        catch (error) {
            next(error);
        }
    }
    async getOnlineUsers(req, res, next) {
        try {
            const result = await friend_service_1.friendService.getOnlineUsers(req.userId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async sendRequest(req, res, next) {
        try {
            const { username } = req.body;
            const request = await friend_service_1.friendService.sendRequest(req.userId, username);
            res.status(201).json({
                success: true,
                message: 'Do‘stlik so‘rovi yuborildi',
                data: request,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async respondRequest(req, res, next) {
        try {
            const id = req.params.id;
            const { action } = req.body;
            const result = await friend_service_1.friendService.respondToRequest(req.userId, id, action);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async removeFriend(req, res, next) {
        try {
            const id = req.params.id;
            const result = await friend_service_1.friendService.removeFriend(req.userId, id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getPendingRequests(req, res, next) {
        try {
            const requests = await friend_service_1.friendService.getPendingRequests(req.userId);
            res.json({ success: true, data: requests });
        }
        catch (error) {
            next(error);
        }
    }
    // Chat
    async getMessages(req, res, next) {
        try {
            const userId = req.params.userId;
            const messages = await chat_service_1.chatService.getMessages(req.userId, userId);
            res.json({ success: true, data: messages });
        }
        catch (error) {
            next(error);
        }
    }
    async sendMessage(req, res, next) {
        try {
            const { receiverId, message } = req.body;
            const created = await chat_service_1.chatService.sendMessage(req.userId, receiverId, message);
            res.status(201).json({
                success: true,
                data: created,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getConversations(req, res, next) {
        try {
            const convs = await chat_service_1.chatService.getConversations(req.userId);
            res.json({ success: true, data: convs });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SocialController = SocialController;
exports.socialController = new SocialController();
