"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportService = exports.ExportService = void 0;
const prisma_1 = require("../config/prisma");
const json2csv_1 = require("json2csv");
const XLSX = __importStar(require("xlsx"));
class ExportService {
    /**
     * Export transactions as CSV string (Only authenticated user's transactions)
     */
    async exportCSV(userId) {
        const transactions = await prisma_1.prisma.transaction.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { date: 'desc' },
        });
        const data = transactions.map((t) => ({
            ID: t.id,
            Sana: t.date.toISOString().split('T')[0],
            Turi: t.type === 'INCOME' ? 'Daromad' : 'Xarajat',
            Summa: t.amount,
            Kategoriya: t.category?.name || 'Boshqa',
            Nomi: t.title,
            Izoh: t.description || '',
        }));
        const fields = ['ID', 'Sana', 'Turi', 'Summa', 'Kategoriya', 'Nomi', 'Izoh'];
        const json2csvParser = new json2csv_1.Parser({ fields });
        return json2csvParser.parse(data);
    }
    /**
     * Export transactions as Excel XLSX buffer (Only authenticated user's transactions)
     */
    async exportExcel(userId) {
        const transactions = await prisma_1.prisma.transaction.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { date: 'desc' },
        });
        const data = transactions.map((t) => ({
            ID: t.id,
            Sana: t.date.toISOString().split('T')[0],
            Turi: t.type === 'INCOME' ? 'Daromad' : 'Xarajat',
            Summa: t.amount,
            Kategoriya: t.category?.name || 'Boshqa',
            Nomi: t.title,
            Izoh: t.description || '',
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Tranzaksiyalar');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
}
exports.ExportService = ExportService;
exports.exportService = new ExportService();
