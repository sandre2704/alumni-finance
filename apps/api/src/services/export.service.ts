import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { transactions } from '../db/schema/transactions.js';
import { categories } from '../db/schema/categories.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export class ExportService {
    private static async getTransactions(startDate: string, endDate: string) {
        console.log(`[Export] Fetching transactions from ${startDate} to ${endDate}`);

        // Use SQL date casting for proper comparison
        const result = await db
            .select({
                date: transactions.transactionDate,
                type: transactions.type,
                amount: transactions.amount,
                category: categories.name,
                categoryType: categories.type,
                description: transactions.description,
                donorName: transactions.donorName,
                isAnonymous: transactions.isAnonymous,
            })
            .from(transactions)
            .leftJoin(categories, eq(transactions.categoryId, categories.id))
            .where(
                and(
                    sql`${transactions.transactionDate} >= ${startDate}::date`,
                    sql`${transactions.transactionDate} <= ${endDate}::date`
                )
            )
            .orderBy(desc(transactions.transactionDate));

        console.log(`[Export] Found ${result.length} transactions in date range`);
        return result;
    }

    private static formatCurrency(amount: string | number) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(amount));
    }

    static async generatePDF(startDate: string, endDate: string): Promise<PDFKit.PDFDocument> {
        const data = await this.getTransactions(startDate, endDate);
        const doc = new PDFDocument({ margin: 50 });

        // Header
        doc.fontSize(20).text('Laporan Keuangan Alumni Finance', { align: 'center' });
        doc.fontSize(12).moveDown(0.5).text(`Periode: ${format(new Date(startDate), 'dd MMMM yyyy', { locale: id })} - ${format(new Date(endDate), 'dd MMMM yyyy', { locale: id })}`, { align: 'center' });
        doc.moveDown(2);

        // Summary
        const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
        const netBalance = totalIncome - totalExpense;

        doc.fontSize(12).text(`Total Pemasukan: ${this.formatCurrency(totalIncome)}`);
        doc.text(`Total Pengeluaran: ${this.formatCurrency(totalExpense)}`);
        doc.text(`Saldo Bersih: ${this.formatCurrency(netBalance)}`);
        doc.moveDown(2);

        // Table Header
        const tableTop = doc.y;
        const colDate = 50;
        const colType = 130;
        const colCategory = 200;
        const colDesc = 300;
        const colAmount = 450;

        doc.font('Helvetica-Bold');
        doc.text('Tanggal', colDate, tableTop);
        doc.text('Tipe', colType, tableTop);
        doc.text('Kategori', colCategory, tableTop);
        doc.text('Keterangan', colDesc, tableTop);
        doc.text('Jumlah', colAmount, tableTop, { align: 'right', width: 100 });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
        doc.font('Helvetica');

        let y = tableTop + 25;

        data.forEach((item) => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }

            const rawDate = new Date(item.date);
            const formattedDate = format(rawDate, 'dd/MM/yyyy');
            const type = item.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
            const category = item.category || '-';
            const descText = item.description || (item.donorName ? `Donasi: ${item.isAnonymous ? 'Hamba Allah' : item.donorName}` : '-');
            const amount = this.formatCurrency(item.amount);

            doc.text(formattedDate, colDate, y);
            doc.text(type, colType, y);
            doc.text(category, colCategory, y, { width: 90, ellipsis: true });
            doc.text(descText, colDesc, y, { width: 140, ellipsis: true });
            doc.text(amount, colAmount, y, { align: 'right', width: 100 });

            y += 20;
        });

        doc.end();
        return doc;
    }

    static async generateExcel(startDate: string, endDate: string): Promise<ExcelJS.Workbook> {
        const data = await this.getTransactions(startDate, endDate);
        const workbook = new ExcelJS.Workbook();

        // ========== SHEET 1: Data Transaksi ==========
        const worksheet = workbook.addWorksheet('Data Transaksi');

        worksheet.columns = [
            { header: 'Tanggal', key: 'date', width: 15 },
            { header: 'Tipe', key: 'type', width: 12 },
            { header: 'Kategori', key: 'category', width: 20 },
            { header: 'Keterangan', key: 'description', width: 40 },
            { header: 'Jumlah', key: 'amount', width: 20 },
            { header: 'Donatur', key: 'donorName', width: 20 },
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F81BD' }
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        data.forEach(item => {
            worksheet.addRow({
                date: new Date(item.date),
                type: item.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                category: item.category || '-',
                description: item.description || '-',
                amount: Number(item.amount),
                donorName: item.donorName ? (item.isAnonymous ? 'Hamba Allah' : item.donorName) : '-'
            });
        });

        worksheet.getColumn('amount').numFmt = '"Rp"#,##0';

        // ========== SHEET 2: Ringkasan ==========
        const summarySheet = workbook.addWorksheet('Ringkasan');
        const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

        summarySheet.addRow(['RINGKASAN KEUANGAN']);
        summarySheet.getRow(1).font = { bold: true, size: 14 };
        summarySheet.addRow(['Periode', `${startDate} s/d ${endDate}`]);
        summarySheet.addRow([]);
        summarySheet.addRow(['Total Pemasukan', totalIncome]);
        summarySheet.addRow(['Total Pengeluaran', totalExpense]);
        summarySheet.addRow(['Saldo Bersih', totalIncome - totalExpense]);

        summarySheet.getColumn(1).width = 20;
        summarySheet.getColumn(2).width = 25;
        summarySheet.getColumn(2).numFmt = '"Rp"#,##0';

        // ========== SHEET 3: Pivot - Nominal, Kategori, Jenis ==========
        const pivotSheet = workbook.addWorksheet('Pivot Data');

        pivotSheet.addRow(['PIVOT: NOMINAL PER KATEGORI & JENIS']);
        pivotSheet.getRow(1).font = { bold: true, size: 14 };
        pivotSheet.addRow([]);

        // Header row with styling
        const headerRow = pivotSheet.addRow(['Kategori', 'Jenis Transaksi', 'Jumlah Transaksi', 'Total Nominal']);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F81BD' }
        };

        // Group by category and type
        const pivotData: Record<string, { income: number; expense: number; incomeCount: number; expenseCount: number }> = {};

        data.forEach(item => {
            const cat = item.category || 'Tanpa Kategori';
            if (!pivotData[cat]) {
                pivotData[cat] = { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 };
            }
            if (item.type === 'income') {
                pivotData[cat].income += Number(item.amount);
                pivotData[cat].incomeCount++;
            } else {
                pivotData[cat].expense += Number(item.amount);
                pivotData[cat].expenseCount++;
            }
        });

        // Add data rows
        Object.entries(pivotData).forEach(([cat, totals]) => {
            if (totals.incomeCount > 0) {
                pivotSheet.addRow([cat, 'Pemasukan', totals.incomeCount, totals.income]);
            }
            if (totals.expenseCount > 0) {
                pivotSheet.addRow([cat, 'Pengeluaran', totals.expenseCount, totals.expense]);
            }
        });

        // Add totals
        pivotSheet.addRow([]);
        const totalRow = pivotSheet.addRow([
            'TOTAL',
            '',
            data.length,
            totalIncome - totalExpense
        ]);
        totalRow.font = { bold: true };
        totalRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDDDDDD' }
        };

        // Column widths and formatting
        pivotSheet.getColumn(1).width = 25;
        pivotSheet.getColumn(2).width = 18;
        pivotSheet.getColumn(3).width = 18;
        pivotSheet.getColumn(4).width = 20;
        pivotSheet.getColumn(4).numFmt = '"Rp"#,##0';

        // ========== SHEET 4: Pivot - Per Tipe ==========
        const pivotTypeSheet = workbook.addWorksheet('Pivot Tipe');

        pivotTypeSheet.addRow(['PIVOT: PER TIPE TRANSAKSI']);
        pivotTypeSheet.getRow(1).font = { bold: true, size: 14 };
        pivotTypeSheet.addRow([]);

        const typeHeaderRow = pivotTypeSheet.addRow(['Tipe', 'Jumlah Transaksi', 'Total Nilai']);
        typeHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        typeHeaderRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F81BD' }
        };

        const incomeCount = data.filter(t => t.type === 'income').length;
        const expenseCount = data.filter(t => t.type === 'expense').length;

        pivotTypeSheet.addRow(['Pemasukan', incomeCount, totalIncome]);
        pivotTypeSheet.addRow(['Pengeluaran', expenseCount, totalExpense]);
        pivotTypeSheet.addRow([]);
        const typeTotalRow = pivotTypeSheet.addRow(['TOTAL', incomeCount + expenseCount, totalIncome - totalExpense]);
        typeTotalRow.font = { bold: true };

        pivotTypeSheet.getColumn(1).width = 20;
        pivotTypeSheet.getColumn(2).width = 20;
        pivotTypeSheet.getColumn(3).width = 20;
        pivotTypeSheet.getColumn(3).numFmt = '"Rp"#,##0';

        return workbook;
    }
}
