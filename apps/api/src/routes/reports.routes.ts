import { Router, Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service.js';
import { z } from 'zod';

const router: Router = Router();
console.log('📊 Reports routes loaded - daily-cashflow should be available');

const dateRangeSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
}); // Updated

// Get financial summary
router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;
        const summary = await reportService.getSummary(startDate as string, endDate as string);

        res.json({
            success: true,
            data: summary,
        });
    } catch (error) {
        next(error);
    }
});

// Get income by category
router.get('/income-by-category', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;
        const breakdown = await reportService.getIncomeByCategory(startDate as string, endDate as string);

        res.json({
            success: true,
            data: breakdown,
        });
    } catch (error) {
        next(error);
    }
});

// Get expense by category
router.get('/expense-by-category', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;
        const breakdown = await reportService.getExpenseByCategory(startDate as string, endDate as string);

        res.json({
            success: true,
            data: breakdown,
        });
    } catch (error) {
        next(error);
    }
});

// Get daily cash flow
router.get('/daily-cashflow', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;
        const result = await reportService.getDailyCashFlow(startDate as string, endDate as string);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

// Get monthly comparison (income vs expense)
router.get('/monthly-comparison', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;
        const comparison = await reportService.getMonthlyComparison(startDate as string, endDate as string);

        res.json({
            success: true,
            data: comparison,
        });
    } catch (error) {
        next(error);
    }
});

// Export PDF report
router.get('/export/pdf', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;
        const pdfBuffer = await reportService.exportPdf(startDate as string, endDate as string);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=laporan-keuangan-${startDate}-${endDate}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
});

// Export Excel report
router.get('/export/excel', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;
        const excelBuffer = await reportService.exportExcel(startDate as string, endDate as string);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=laporan-keuangan-${startDate}-${endDate}.xlsx`);
        res.send(excelBuffer);
    } catch (error) {
        next(error);
    }
});

export default router;
