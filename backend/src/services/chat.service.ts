import { prisma } from '../config/prisma';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class ChatService {
  /**
   * Send a direct message to a friend
   */
  public async sendMessage(senderId: string, receiverId: string, messageText: string) {
    if (senderId === receiverId) {
      throw new BadRequestError('O‘zingizga xabar yubora olmaysiz');
    }

    const trimmed = messageText.trim();
    if (!trimmed) {
      throw new BadRequestError('Xabar matni bo‘sh bo‘lishi mumkin emas');
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundError('Qabul qiluvchi topilmadi');
    }

    const message = await prisma.message.create({
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
  public async getMessages(userId: string, partnerId: string) {
    // Mark received unread messages as read
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    });

    const messages = await prisma.message.findMany({
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
  public async getConversations(userId: string) {
    // Find all distinct partners
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const partnerMap = new Map<string, { lastMessage: string; timestamp: Date; unreadCount: number }>();

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
        const item = partnerMap.get(partnerId)!;
        item.unreadCount += 1;
      }
    }

    const partnerIds = Array.from(partnerMap.keys());
    const partners = await prisma.user.findMany({
      where: { id: { in: partnerIds } },
      select: { id: true, username: true },
    });

    return partners.map((p) => {
      const conv = partnerMap.get(p.id)!;
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

export const chatService = new ChatService();
