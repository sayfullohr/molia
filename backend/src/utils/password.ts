import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'system',
  'support',
  'root',
  'moderator',
  'superuser',
  'owner',
  'api',
  'auth',
  'security',
  'official',
  'help',
  'molia',
]);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { valid: false, error: 'Foydalanuvchi nomi 3 dan 20 belgichagacha bo‘lishi kerak' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { valid: false, error: 'Foydalanuvchi nomi faqat harflar, raqamlar va tagchiziq (_) dan iborat bo‘lishi kerak' };
  }
  const normalized = normalizeUsername(trimmed);
  if (RESERVED_USERNAMES.has(normalized)) {
    return { valid: false, error: 'Ushbu foydalanuvchi nomi tizim tomonidan band qilingan' };
  }
  return { valid: true };
}

export function validatePasswordComplexity(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Parol kamida 8 ta belgidan iborat bo‘lishi kerak' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Parolda kamida bitta katta harf (A-Z) bo‘lishi kerak' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Parolda kamida bitta kichik harf (a-z) bo‘lishi kerak' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Parolda kamida bitta raqam (0-9) bo‘lishi kerak' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return { valid: false, error: 'Parolda kamida bitta maxsus belgi (!@#$%^&*...) bo‘lishi kerak' };
  }
  return { valid: true };
}
