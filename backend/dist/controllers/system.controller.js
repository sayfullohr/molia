"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityController = exports.gamificationController = exports.SecurityController = exports.GamificationController = void 0;
const gamification_service_1 = require("../services/gamification.service");
const security_service_1 = require("../services/security.service");
const export_service_1 = require("../services/export.service");
class GamificationController {
    async getStats(req, res, next) {
        try {
            const stats = await gamification_service_1.gamificationService.getUserStats(req.userId);
            res.json({ success: true, data: stats });
        }
        catch (error) {
            next(error);
        }
    }
    async getLeaderboard(req, res, next) {
        try {
            const filter = req.query.filter || 'global';
            const leaderboard = await gamification_service_1.gamificationService.getLeaderboard(req.userId, filter);
            res.json({ success: true, data: leaderboard });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.GamificationController = GamificationController;
class SecurityController {
    // Notifications
    async getNotifications(req, res, next) {
        try {
            const notifs = await security_service_1.notificationService.getNotifications(req.userId);
            res.json({ success: true, data: notifs });
        }
        catch (error) {
            next(error);
        }
    }
    async markNotificationRead(req, res, next) {
        try {
            const id = req.params.id;
            const updated = await security_service_1.notificationService.markAsRead(req.userId, id);
            res.json({ success: true, data: updated });
        }
        catch (error) {
            next(error);
        }
    }
    async markAllNotificationsRead(req, res, next) {
        try {
            await security_service_1.notificationService.markAllAsRead(req.userId);
            res.json({ success: true, message: 'Barcha bildirishnomalar o‘qildi' });
        }
        catch (error) {
            next(error);
        }
    }
    // Security Monitoring & Sessions
    async getLoginHistory(req, res, next) {
        try {
            const history = await security_service_1.securityService.getLoginHistory(req.userId);
            res.json({ success: true, data: history });
        }
        catch (error) {
            next(error);
        }
    }
    async getActiveSessions(req, res, next) {
        try {
            const sessions = await security_service_1.securityService.getActiveSessions(req.userId);
            res.json({ success: true, data: sessions });
        }
        catch (error) {
            next(error);
        }
    }
    async revokeSession(req, res, next) {
        try {
            const id = req.params.id;
            await security_service_1.securityService.revokeSession(req.userId, id);
            res.json({ success: true, message: 'Sessiya bekor qilindi' });
        }
        catch (error) {
            next(error);
        }
    }
    // Exports
    async exportCSV(req, res, next) {
        try {
            const csv = await export_service_1.exportService.exportCSV(req.userId);
            res.header('Content-Type', 'text/csv');
            res.attachment(`molia_transactions_${new Date().toISOString().split('T')[0]}.csv`);
            res.send(csv);
        }
        catch (error) {
            next(error);
        }
    }
    async exportExcel(req, res, next) {
        try {
            const buffer = await export_service_1.exportService.exportExcel(req.userId);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=molia_transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
            res.send(buffer);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SecurityController = SecurityController;
exports.gamificationController = new GamificationController();
exports.securityController = new SecurityController();
