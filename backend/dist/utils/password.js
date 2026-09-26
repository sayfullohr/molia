"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESERVED_USERNAMES = void 0;
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.normalizeUsername = normalizeUsername;
exports.validateUsername = validateUsername;
exports.validatePasswordComplexity = validatePasswordComplexity;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = 12;
exports.RESERVED_USERNAMES = new Set([
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
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, SALT_ROUNDS);
}
async function comparePassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
function normalizeUsername(username) {
    return username.trim().toLowerCase();
}
function validateUsername(username) {
    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
        return { valid: false, error: 'Foydalanuvchi nomi 3 dan 20 belgichagacha bo‘lishi kerak' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
        return { valid: false, error: 'Foydalanuvchi nomi faqat harflar, raqamlar va tagchiziq (_) dan iborat bo‘lishi kerak' };
    }
    const normalized = normalizeUsername(trimmed);
    if (exports.RESERVED_USERNAMES.has(normalized)) {
        return { valid: false, error: 'Ushbu foydalanuvchi nomi tizim tomonidan band qilingan' };
    }
    return { valid: true };
}
function validatePasswordComplexity(password) {
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
