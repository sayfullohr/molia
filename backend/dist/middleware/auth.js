"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const prisma_1 = require("../config/prisma");
const errors_1 = require("../utils/errors");
const env_1 = require("../config/env");
async function requireAuth(req, res, next) {
    try {
        let sessionId = req.cookies?.[env_1.config.sessionCookieName];
        // Also support Authorization header for flexibility
        if (!sessionId && req.headers.authorization) {
            const parts = req.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                sessionId = parts[1];
            }
        }
        if (!sessionId) {
            throw new errors_1.UnauthorizedError('Tizimga kirish talab qilinadi');
        }
        const session = await prisma_1.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });
        if (!session) {
            throw new errors_1.UnauthorizedError('Sessiya topilmadi');
        }
        if (session.revokedAt) {
            throw new errors_1.UnauthorizedError('Sessiya bekor qilingan');
        }
        if (new Date() > session.expiresAt) {
            throw new errors_1.UnauthorizedError('Sessiya muddati tugagan');
        }
        req.userId = session.userId;
        req.sessionId = session.id;
        req.user = session.user;
        next();
    }
    catch (error) {
        next(error);
    }
}
