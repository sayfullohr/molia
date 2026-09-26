"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = exports.ChatService = void 0;
const prisma_1 = require("../config/prisma");
const errors_1 = require("../utils/errors");
class ChatService {
    /**
     * Send a direct message to a friend
     */
    async sendMessage(senderId, receiverId, messageText) {
        if (senderId === receiverId) {
            throw new errors_1.BadRequestError('O‘zingizga xabar yubora olmaysiz');
        }
        const trimmed = messageText.trim();
        if (!trimmed) {
            throw new errors_1.BadRequestError('Xabar matni bo‘sh bo‘lishi mumkin emas');
        }
        // Verify receiver exists
        const receiver = await prisma_1.prisma.user.findUnique({
            where: { id: receiverId },
        });
        if (!receiver) {
            throw new errors_1.NotFoundError('Qabul qiluvchi topilmadi');
        }
        const message = await prisma_1.prisma.message.create({
            data: {
                senderId,
                receiverId,
                message: trimmed,
                read: false,
            },
        });
        return message;
    }
    /**
     * Get message history between two users
     */
    async getMessages(userId, partnerId) {
        // Mark received unread messages as read
        await prisma_1.prisma.message.updateMany({
            where: {
                senderId: partnerId,
                receiverId: userId,
                read: false,
            },
            data: { read: true },
        });
        const messages = await prisma_1.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: userId },
                ],
            },
            orderBy: { createdAt: 'asc' },
            take: 100,
        });
        return messages;
    }
    /**
     * Get list of active conversations with last message and unread count
     */
    async getConversations(userId) {
        // Find all distinct partners
        const messages = await prisma_1.prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
        const partnerMap = new Map();
        for (const msg of messages) {
            const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            if (!partnerMap.has(partnerId)) {
                partnerMap.set(partnerId, {
                    lastMessage: msg.message,
                    timestamp: msg.createdAt,
                    unreadCount: 0,
                });
            }
            if (msg.receiverId === userId && !msg.read) {
                const item = partnerMap.get(partnerId);
                item.unreadCount += 1;
            }
        }
        const partnerIds = Array.from(partnerMap.keys());
        const partners = await prisma_1.prisma.user.findMany({
            where: { id: { in: partnerIds } },
            select: { id: true, username: true },
        });
        return partners.map((p) => {
            const conv = partnerMap.get(p.id);
            return {
                partnerId: p.id,
                username: p.username,
                lastMessage: conv.lastMessage,
                timestamp: conv.timestamp,
                unreadCount: conv.unreadCount,
            };
        });
    }
}
exports.ChatService = ChatService;
exports.chatService = new ChatService();
