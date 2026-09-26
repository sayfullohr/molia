"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendService = exports.FriendService = void 0;
const prisma_1 = require("../config/prisma");
const errors_1 = require("../utils/errors");
const gamification_service_1 = require("./gamification.service");
const game_service_1 = require("./game.service");
class FriendService {
    /**
     * Search users by username (excluding self)
     */
    async searchUsers(currentUserId, query) {
        if (!query || query.trim().length < 2)
            return [];
        const normalized = query.trim().toLowerCase();
        const users = await prisma_1.prisma.user.findMany({
            where: {
                username: {
                    contains: normalized,
                },
                id: {
                    not: currentUserId,
                },
            },
            select: {
                id: true,
                username: true,
                createdAt: true,
            },
            take: 10,
        });
        // Check relationship status for each user
        const results = await Promise.all(users.map(async (u) => {
            const isFriend = await prisma_1.prisma.friend.findFirst({
                where: {
                    OR: [
                        { userId: currentUserId, friendId: u.id },
                        { userId: u.id, friendId: currentUserId },
                    ],
                },
            });
            const pendingRequest = await prisma_1.prisma.friendRequest.findFirst({
                where: {
                    OR: [
                        { senderId: currentUserId, receiverId: u.id, status: 'PENDING' },
                        { senderId: u.id, receiverId: currentUserId, status: 'PENDING' },
                    ],
                },
            });
            let status = 'NONE';
            if (isFriend)
                status = 'FRIEND';
            else if (pendingRequest) {
                status = pendingRequest.senderId === currentUserId ? 'SENT' : 'RECEIVED';
            }
            const stats = await gamification_service_1.gamificationService.getUserStats(u.id);
            return {
                id: u.id,
                username: u.username,
                level: stats.level,
                streak: stats.streak,
                relationshipStatus: status,
                requestId: pendingRequest?.id,
            };
        }));
        return results;
    }
    /**
     * Send a friend request
     */
    async sendRequest(senderId, targetUsername) {
        const normalized = targetUsername.trim().toLowerCase();
        const targetUser = await prisma_1.prisma.user.findUnique({
            where: { username: normalized },
        });
        if (!targetUser) {
            throw new errors_1.NotFoundError('Foydalanuvchi topilmadi');
        }
        if (targetUser.id === senderId) {
            throw new errors_1.BadRequestError('O‘zingizga do‘stlik so‘rovi yubora olmaysiz');
        }
        // Check if already friends
        const alreadyFriends = await prisma_1.prisma.friend.findFirst({
            where: {
                OR: [
                    { userId: senderId, friendId: targetUser.id },
                    { userId: targetUser.id, friendId: senderId },
                ],
            },
        });
        if (alreadyFriends) {
            throw new errors_1.BadRequestError('Siz allaqachon do‘st emassiz');
        }
        // Check existing pending request
        const existingReq = await prisma_1.prisma.friendRequest.findFirst({
            where: {
                senderId,
                receiverId: targetUser.id,
                status: 'PENDING',
            },
        });
        if (existingReq) {
            throw new errors_1.BadRequestError('Do‘stlik so‘rovi allaqachon yuborilgan');
        }
        const request = await prisma_1.prisma.friendRequest.create({
            data: {
                senderId,
                receiverId: targetUser.id,
                status: 'PENDING',
            },
        });
        const sender = await prisma_1.prisma.user.findUnique({
            where: { id: senderId },
            select: { username: true },
        });
        // Send notification
        await prisma_1.prisma.notification.create({
            data: {
                userId: targetUser.id,
                type: 'FRIEND_REQUEST',
                title: 'Yangi do‘stlik so‘rovi',
                message: `${sender?.username} sizga do‘stlik so‘rovini yubordi.`,
            },
        });
        return request;
    }
    /**
     * Accept or reject friend request
     */
    async respondToRequest(userId, requestId, action) {
        const request = await prisma_1.prisma.friendRequest.findUnique({
            where: { id: requestId },
            include: { sender: true },
        });
        if (!request || request.receiverId !== userId) {
            throw new errors_1.NotFoundError('Do‘stlik so‘rovi topilmadi');
        }
        if (request.status !== 'PENDING') {
            throw new errors_1.BadRequestError('Bu so‘rov allaqachon ko‘rib chiqilgan');
        }
        if (action === 'REJECT') {
            await prisma_1.prisma.friendRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED' },
            });
            return { success: true, message: 'Do‘stlik so‘rovi rad etildi' };
        }
        // ACCEPT: create friendship both ways or unique pair
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.friendRequest.update({
                where: { id: requestId },
                data: { status: 'ACCEPTED' },
            }),
            prisma_1.prisma.friend.create({
                data: {
                    userId: request.senderId,
                    friendId: request.receiverId,
                },
            }),
            prisma_1.prisma.friend.create({
                data: {
                    userId: request.receiverId,
                    friendId: request.senderId,
                },
            }),
        ]);
        // Check achievement for first friend
        await gamification_service_1.gamificationService.checkAndUnlockAchievement(request.senderId, 'FIRST_FRIEND');
        await gamification_service_1.gamificationService.checkAndUnlockAchievement(request.receiverId, 'FIRST_FRIEND');
        // Notification to sender
        const receiver = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { username: true },
        });
        await prisma_1.prisma.notification.create({
            data: {
                userId: request.senderId,
                type: 'FRIEND_REQUEST',
                title: 'Do‘stlik qabul qilindi',
                message: `${receiver?.username} do‘stlik so‘rovingizni qabul qildi.`,
            },
        });
        return { success: true, message: 'Do‘stlik so‘rovi qabul qilindi' };
    }
    /**
     * Remove friend
     */
    async removeFriend(userId, friendId) {
        await prisma_1.prisma.friend.deleteMany({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });
        return { success: true, message: 'Do‘stlar safidan chiqarildi' };
    }
    /**
     * Get all friends of user with gamification stats (NO private financial info)
     */
    async getFriends(userId) {
        const friendRelations = await prisma_1.prisma.friend.findMany({
            where: { userId },
            include: {
                friend: {
                    select: {
                        id: true,
                        username: true,
                        createdAt: true,
                    },
                },
            },
        });
        const friends = await Promise.all(friendRelations.map(async (rel) => {
            const stats = await gamification_service_1.gamificationService.getUserStats(rel.friend.id);
            // Check active session (not revoked and not expired)
            const activeSession = await prisma_1.prisma.session.findFirst({
                where: {
                    userId: rel.friend.id,
                    revokedAt: null,
                    expiresAt: { gt: new Date() },
                },
            });
            return {
                id: rel.friend.id,
                username: rel.friend.username,
                level: stats.level,
                streak: stats.streak,
                totalXP: stats.totalXP,
                isOnline: Boolean(activeSession),
                joinedAt: rel.friend.createdAt,
            };
        }));
        return friends;
    }
    /**
     * Get online friends and active community players currently in games
     */
    async getOnlineUsers(userId) {
        const friends = await this.getFriends(userId);
        const activeGameIds = game_service_1.GameService.getActiveGameUserIds();
        const onlineFriends = friends.map((f) => ({
            ...f,
            isInGame: activeGameIds.includes(f.id),
            isOnline: f.isOnline || activeGameIds.includes(f.id),
        })).filter((f) => f.isOnline);
        // Only get other active users who are ACTUALLY currently active in games
        const existingFriendIds = friends.map((f) => f.id);
        const excludeIds = [userId, ...existingFriendIds];
        const activePlayerIds = activeGameIds.filter((id) => !excludeIds.includes(id));
        let otherUsers = [];
        if (activePlayerIds.length > 0) {
            otherUsers = await prisma_1.prisma.user.findMany({
                where: { id: { in: activePlayerIds } },
                select: { id: true, username: true, createdAt: true },
            });
        }
        const communityPlayers = await Promise.all(otherUsers.map(async (u) => {
            const stats = await gamification_service_1.gamificationService.getUserStats(u.id);
            return {
                id: u.id,
                username: u.username,
                level: stats.level,
                streak: stats.streak,
                totalXP: stats.totalXP,
                isOnline: true,
                isInGame: true,
                isFriend: false,
                joinedAt: u.createdAt,
            };
        }));
        return {
            friends: onlineFriends,
            allFriends: friends,
            communityPlayers,
        };
    }
    /**
     * Get pending received and sent friend requests
     */
    async getPendingRequests(userId) {
        const received = await prisma_1.prisma.friendRequest.findMany({
            where: { receiverId: userId, status: 'PENDING' },
            include: {
                sender: {
                    select: { id: true, username: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const sent = await prisma_1.prisma.friendRequest.findMany({
            where: { senderId: userId, status: 'PENDING' },
            include: {
                receiver: {
                    select: { id: true, username: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return { received, sent };
    }
}
exports.FriendService = FriendService;
exports.friendService = new FriendService();
