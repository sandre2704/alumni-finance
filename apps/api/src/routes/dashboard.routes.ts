import { Router, Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';

const router = Router();

// Get summary stats (balance, income, expense)
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await dashboardService.getStats();

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
});

// Get cash flow data for chart
router.get('/cashflow', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const months = parseInt(req.query.months as string) || 6;
        const cashflow = await dashboardService.getCashflow(months);

        res.json({
            success: true,
            data: cashflow,
        });
    } catch (error) {
        next(error);
    }
});

// Get expense breakdown by category
router.get('/expense-breakdown', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        const breakdown = await dashboardService.getExpenseBreakdown(startDate, endDate);

        res.json({
            success: true,
            data: breakdown,
        });
    } catch (error) {
        next(error);
    }
});

// Get income breakdown by category
router.get('/income-breakdown', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        const breakdown = await dashboardService.getIncomeBreakdown(startDate, endDate);

        res.json({
            success: true,
            data: breakdown,
        });
    } catch (error) {
        next(error);
    }
});

// Get recent transactions
router.get('/recent-transactions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 5;
        const transactions = await dashboardService.getRecentTransactions(limit);

        res.json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        next(error);
    }
});

// Get active donation target progress
router.get('/donation-progress', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const progress = await dashboardService.getDonationProgress();

        res.json({
            success: true,
            data: progress,
        });
    } catch (error) {
        next(error);
    }
});

// Get budget status
router.get('/budget-status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = await dashboardService.getBudgetStatus();

        res.json({
            success: true,
            data: status,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
