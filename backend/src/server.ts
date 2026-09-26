import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { prisma } from './config/prisma';
import apiRouter from './routes';
import { errorHandler } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimiter';
import { seedDefaults } from './utils/seed';

const app = express();

// 1. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS configuration (allowing frontend credentials & HttpOnly cookies)
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 3. Body & Cookie Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.sessionSecret));

// 4. Rate Limiting for API
app.use('/api', generalLimiter);

// 5. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Molia Strategy API xizmati faol ishlamoqda',
    timestamp: new Date().toISOString(),
  });
});

// 6. Mount All API Routes
app.use('/api', apiRouter);

// 7. 404 Handler in Uzbek
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'So‘ralgan resurs serverda topilmadi',
  });
});

// 8. Centralized Uzbek Error Handling
app.use(errorHandler);

// Start Server & Auto-seed Defaults
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✓ Ma’lumotlar bazasiga muvaffaqiyatli ulandi');

    await seedDefaults();

    app.listen(config.port, () => {
      console.log(`🚀 Molia Strategy Backend server ishga tushdi: http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Serverni ishga tushirishda xatolik:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nServer to‘xtatilmoqda...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nServer to‘xtatilmoqda...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
