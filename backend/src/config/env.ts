import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  sessionSecret: process.env.SESSION_SECRET || 'fallback_session_secret_molia_platform_2026',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/molia_db?schema=public',
  sessionCookieName: 'molia_sid',
  sessionDurationDays: 30,
};
