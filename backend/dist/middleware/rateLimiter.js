"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.generalLimiter = void 0;
// Rate limit cheklovlarini to'liq olib tashlash (erkin foydalanish uchun)
const generalLimiter = (req, res, next) => {
    next();
};
exports.generalLimiter = generalLimiter;
const authLimiter = (req, res, next) => {
    next();
};
exports.authLimiter = authLimiter;
