"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../utils/errors");
const zod_1 = require("zod");
function errorHandler(err, req, res, next) {
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        const errorMessages = err.errors.map((e) => e.message).join(', ');
        res.status(400).json({
            success: false,
            message: errorMessages || 'Kiritilgan ma’lumotlar yaroqsiz',
            errors: err.errors,
        });
        return;
    }
    // App operational errors
    if (err instanceof errors_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }
    // Fallback for unexpected errors
    console.error('[Unhandled Error]:', err);
    res.status(500).json({
        success: false,
        message: 'Kutilmagan texnik nosozlik yuz berdi. Iltimos keyinroq qayta urinib ko‘ring.',
    });
}
