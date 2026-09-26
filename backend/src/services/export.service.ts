import { prisma } from '../config/prisma';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';

export class ExportService {
  /**
   * Export transactions as CSV string (Only authenticated user's transactions)
   */
  public async exportCSV(userId: string): Promise<string> {
    const transactions = await prisma.transaction.findMany({
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
    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(data);
  }

  /**
   * Export transactions as Excel XLSX buffer (Only authenticated user's transactions)
   */
  public async exportExcel(userId: string): Promise<Buffer> {
    const transactions = await prisma.transaction.findMany({
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

export const exportService = new ExportService();
