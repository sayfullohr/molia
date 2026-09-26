"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const prisma_1 = require("./config/prisma");
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const rateLimiter_1 = require("./middleware/rateLimiter");
const seed_1 = require("./utils/seed");
const app = (0, express_1.default)();
// 1. Security Headers via Helmet
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// 2. CORS configuration (allowing frontend credentials & HttpOnly cookies)
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// 3. Body & Cookie Parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)(env_1.config.sessionSecret));
// 4. Rate Limiting for API
app.use('/api', rateLimiter_1.generalLimiter);
// 5. Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Molia Strategy API xizmati faol ishlamoqda',
        timestamp: new Date().toISOString(),
    });
});
// 6. Mount All API Routes
app.use('/api', routes_1.default);
// 7. 404 Handler in Uzbek
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'So‘ralgan resurs serverda topilmadi',
    });
});
// 8. Centralized Uzbek Error Handling
app.use(error_middleware_1.errorHandler);
// Start Server & Auto-seed Defaults
async function startServer() {
    try {
        await prisma_1.prisma.$connect();
        console.log('✓ Ma’lumotlar bazasiga muvaffaqiyatli ulandi');
        await (0, seed_1.seedDefaults)();
        app.listen(env_1.config.port, () => {
            console.log(`🚀 Molia Strategy Backend server ishga tushdi: http://localhost:${env_1.config.port}`);
        });
    }
    catch (error) {
        console.error('Serverni ishga tushirishda xatolik:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nServer to‘xtatilmoqda...');
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\nServer to‘xtatilmoqda...');
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
if (!process.env.VERCEL) {
    startServer();
}
exports.default = app;
module.exports = app;
