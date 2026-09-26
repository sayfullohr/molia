"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const device_1 = require("../utils/device");
const env_1 = require("../config/env");
class AuthController {
    async register(req, res, next) {
        try {
            const { username, password } = req.body;
            const ip = (0, device_1.getClientIp)(req);
            const userAgent = req.headers['user-agent'];
            const result = await auth_service_1.authService.register(username, password, ip, userAgent);
            res.cookie(env_1.config.sessionCookieName, result.sessionId, {
                httpOnly: true,
                secure: env_1.config.nodeEnv === 'production',
                sameSite: 'lax',
                expires: result.expiresAt,
            });
            res.status(201).json({
                success: true,
                message: 'Ro‘yxatdan o‘tish muvaffaqiyatli amalga oshirildi',
                data: {
                    user: result.user,
                    token: result.sessionId,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const ip = (0, device_1.getClientIp)(req);
            const userAgent = req.headers['user-agent'];
            const result = await auth_service_1.authService.login(username, password, ip, userAgent);
            res.cookie(env_1.config.sessionCookieName, result.sessionId, {
                httpOnly: true,
                secure: env_1.config.nodeEnv === 'production',
                sameSite: 'lax',
                expires: result.expiresAt,
            });
            res.json({
                success: true,
                message: 'Tizimga muvaffaqiyatli kirildi',
                data: {
                    user: result.user,
                    token: result.sessionId,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            if (req.sessionId) {
                await auth_service_1.authService.logout(req.sessionId);
            }
            res.clearCookie(env_1.config.sessionCookieName, {
                httpOnly: true,
                secure: env_1.config.nodeEnv === 'production',
                sameSite: 'lax',
            });
            res.json({
                success: true,
                message: 'Sessiya muvaffaqiyatli yakunlandi',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getMe(req, res, next) {
        try {
            const user = await auth_service_1.authService.getCurrentUser(req.userId);
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
