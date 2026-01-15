import { db } from '../db/index.js';
import { transactions, categories } from '../db/schema/index.js';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

class ReportService {
    async getSummary(startDate?: string, endDate?: string) {
        const conditions = [];

        if (startDate) {
            conditions.push(gte(transactions.transactionDate, startDate));
        }
        if (endDate) {
            conditions.push(lte(transactions.transactionDate, endDate));
        }

        const incomeConditions = [...conditions, eq(transactions.type, 'income')];
        const expenseConditions = [...conditions, eq(transactions.type, 'expense')];

        const [income] = await db.select({
            total: sql<string>`COALESCE(SUM(amount), 0)`,
        })
            .from(transactions)
            .where(incomeConditions.length > 0 ? and(...incomeConditions) : undefined);

        const [expense] = await db.select({
            total: sql<string>`COALESCE(SUM(amount), 0)`,
        })
            .from(transactions)
            .where(expenseConditions.length > 0 ? and(...expenseConditions) : undefined);

        const totalIncome = parseFloat(income?.total || '0');
        const totalExpense = parseFloat(expense?.total || '0');

        return {
            totalIncome,
            totalExpense,
            netBalance: totalIncome - totalExpense,
            startDate,
            endDate,
        };
    }

    async getIncomeByCategory(startDate?: string, endDate?: string) {
        const conditions = [eq(transactions.type, 'income')];

        if (startDate) {
            conditions.push(gte(transactions.transactionDate, startDate));
        }
        if (endDate) {
            conditions.push(lte(transactions.transactionDate, endDate));
        }

        const result = await db.select({
            categoryId: transactions.categoryId,
            categoryName: categories.name,
            total: sql<string>`SUM(${transactions.amount})`,
        })
            .from(transactions)
            .leftJoin(categories, eq(transactions.categoryId, categories.id))
            .where(and(...conditions))
            .groupBy(transactions.categoryId, categories.name);

        const grandTotal = result.reduce((acc, row) => acc + parseFloat(row.total || '0'), 0);

        return result.map(row => ({
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            total: parseFloat(row.total || '0'),
            percentage: grandTotal > 0 ? Math.round((parseFloat(row.total || '0') / grandTotal) * 100) : 0,
        }));
    }

    async getExpenseByCategory(startDate?: string, endDate?: string) {
        const conditions = [eq(transactions.type, 'expense')];

        if (startDate) {
            conditions.push(gte(transactions.transactionDate, startDate));
        }
        if (endDate) {
            conditions.push(lte(transactions.transactionDate, endDate));
        }

        const result = await db.select({
            categoryId: transactions.categoryId,
            categoryName: categories.name,
            total: sql<string>`SUM(${transactions.amount})`,
        })
            .from(transactions)
            .leftJoin(categories, eq(transactions.categoryId, categories.id))
            .where(and(...conditions))
            .groupBy(transactions.categoryId, categories.name);

        const grandTotal = result.reduce((acc, row) => acc + parseFloat(row.total || '0'), 0);

        return result.map(row => ({
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            total: parseFloat(row.total || '0'),
            percentage: grandTotal > 0 ? Math.round((parseFloat(row.total || '0') / grandTotal) * 100) : 0,
        }));
    }

    async getDailyCashFlow(startDate?: string, endDate?: string) {
        const conditions = [];

        if (startDate) {
            conditions.push(gte(transactions.transactionDate, startDate));
        }
        if (endDate) {
            conditions.push(lte(transactions.transactionDate, endDate));
        }

        const incomeConditions = [...conditions, eq(transactions.type, 'income')];
        const expenseConditions = [...conditions, eq(transactions.type, 'expense')];

        const incomeData = await db.select({
            date: transactions.transactionDate,
            amount: transactions.amount,
        })
            .from(transactions)
            .where(and(...incomeConditions));

        const expenseData = await db.select({
            date: transactions.transactionDate,
            amount: transactions.amount,
        })
            .from(transactions)
            .where(and(...expenseConditions));

        // Merge data
        const dateMap = new Map<string, { date: string; income: number; expense: number }>();

        const formatDateKey = (date: string | Date | null) => {
            if (!date) return '';
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        incomeData.forEach(item => {
            const dateStr = formatDateKey(item.date);
            if (!dateStr) return;

            if (!dateMap.has(dateStr)) {
                dateMap.set(dateStr, { date: dateStr, income: 0, expense: 0 });
            }
            dateMap.get(dateStr)!.income += parseFloat(item.amount || '0');
        });

        expenseData.forEach(item => {
            const dateStr = formatDateKey(item.date);
            if (!dateStr) return;

            if (!dateMap.has(dateStr)) {
                dateMap.set(dateStr, { date: dateStr, income: 0, expense: 0 });
            }
            dateMap.get(dateStr)!.expense += parseFloat(item.amount || '0');
        });

        // Convert to array and sort by date
        const result = Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (result.length > 0 && startDate && endDate) {
            const filledResult = [];
            const start = new Date(startDate);
            const end = new Date(endDate);

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = formatDateKey(d);
                const existing = dateMap.get(dateStr);
                if (existing) {
                    filledResult.push(existing);
                } else {
                    filledResult.push({ date: dateStr, income: 0, expense: 0 });
                }
            }
            return filledResult;
        }

        return result;
    }

    async getMonthlyComparison(startDate?: string, endDate?: string) {
        // Parse date range and generate monthly data
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();

        const data = [];
        const current = new Date(start.getFullYear(), start.getMonth(), 1);

        while (current <= end) {
            const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
            const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);

            const [income] = await db.select({
                total: sql<string>`COALESCE(SUM(amount), 0)`,
            })
                .from(transactions)
                .where(and(
                    eq(transactions.type, 'income'),
                    gte(transactions.transactionDate, startOfMonth.toISOString().split('T')[0]),
                    lte(transactions.transactionDate, endOfMonth.toISOString().split('T')[0])
                ));

            const [expense] = await db.select({
                total: sql<string>`COALESCE(SUM(amount), 0)`,
            })
                .from(transactions)
                .where(and(
                    eq(transactions.type, 'expense'),
                    gte(transactions.transactionDate, startOfMonth.toISOString().split('T')[0]),
                    lte(transactions.transactionDate, endOfMonth.toISOString().split('T')[0])
                ));

            data.push({
                month: current.toLocaleString('id-ID', { month: 'long' }),
                year: current.getFullYear(),
                income: parseFloat(income?.total || '0'),
                expense: parseFloat(expense?.total || '0'),
            });

            current.setMonth(current.getMonth() + 1);
        }

        return data;
    }

    async exportPdf(startDate?: string, endDate?: string): Promise<Buffer> {
        const summary = await this.getSummary(startDate, endDate);
        const incomeBreakdown = await this.getIncomeByCategory(startDate, endDate);
        const expenseBreakdown = await this.getExpenseByCategory(startDate, endDate);

        return new Promise((resolve, reject) => {
            const chunks: Uint8Array[] = [];
            const doc = new PDFDocument({ margin: 50 });

            doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(24).text('Laporan Keuangan Alumni', { align: 'center' });
            doc.fontSize(12).text(`Periode: ${startDate || 'Awal'} - ${endDate || 'Akhir'}`, { align: 'center' });
            doc.moveDown(2);

            // Summary
            doc.fontSize(16).text('Ringkasan', { underline: true });
            doc.fontSize(12)
                .text(`Total Pemasukan: Rp ${summary.totalIncome.toLocaleString('id-ID')}`)
                .text(`Total Pengeluaran: Rp ${summary.totalExpense.toLocaleString('id-ID')}`)
                .text(`Saldo Bersih: Rp ${summary.netBalance.toLocaleString('id-ID')}`);
            doc.moveDown(2);

            // Income Breakdown
            doc.fontSize(16).text('Pemasukan per Kategori', { underline: true });
            incomeBreakdown.forEach(item => {
                doc.fontSize(12).text(`• ${item.categoryName}: Rp ${item.total.toLocaleString('id-ID')} (${item.percentage}%)`);
            });
            doc.moveDown(2);

            // Expense Breakdown
            doc.fontSize(16).text('Pengeluaran per Kategori', { underline: true });
            expenseBreakdown.forEach(item => {
                doc.fontSize(12).text(`• ${item.categoryName}: Rp ${item.total.toLocaleString('id-ID')} (${item.percentage}%)`);
            });

            doc.end();
        });
    }

    async exportExcel(startDate?: string, endDate?: string): Promise<Buffer> {
        const summary = await this.getSummary(startDate, endDate);
        const incomeBreakdown = await this.getIncomeByCategory(startDate, endDate);
        const expenseBreakdown = await this.getExpenseByCategory(startDate, endDate);

        const workbook = new ExcelJS.Workbook();

        // Summary Sheet
        const summarySheet = workbook.addWorksheet('Ringkasan');
        summarySheet.columns = [
            { header: 'Keterangan', key: 'label', width: 30 },
            { header: 'Nilai (Rp)', key: 'value', width: 20 },
        ];
        summarySheet.addRows([
            { label: 'Periode Awal', value: startDate || 'Semua' },
            { label: 'Periode Akhir', value: endDate || 'Semua' },
            { label: 'Total Pemasukan', value: summary.totalIncome },
            { label: 'Total Pengeluaran', value: summary.totalExpense },
            { label: 'Saldo Bersih', value: summary.netBalance },
        ]);

        // Income Sheet
        const incomeSheet = workbook.addWorksheet('Pemasukan');
        incomeSheet.columns = [
            { header: 'Kategori', key: 'categoryName', width: 30 },
            { header: 'Total (Rp)', key: 'total', width: 20 },
            { header: 'Persentase', key: 'percentage', width: 15 },
        ];
        incomeSheet.addRows(incomeBreakdown);

        // Expense Sheet
        const expenseSheet = workbook.addWorksheet('Pengeluaran');
        expenseSheet.columns = [
            { header: 'Kategori', key: 'categoryName', width: 30 },
            { header: 'Total (Rp)', key: 'total', width: 20 },
            { header: 'Persentase', key: 'percentage', width: 15 },
        ];
        expenseSheet.addRows(expenseBreakdown);

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}

export const reportService = new ReportService();
