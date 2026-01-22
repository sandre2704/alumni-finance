import { Router } from 'express';
import { ExportService } from '../services/export.service.js';
import { z } from 'zod';

export const exportRouter: Router = Router();

export const dateRangeSchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

exportRouter.get('/pdf', async (req, res, next) => {
    try {
        const query = dateRangeSchema.safeParse(req.query);
        if (!query.success) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
        }
        const { startDate, endDate } = query.data;

        const doc = await ExportService.generatePDF(startDate, endDate);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=laporan-${startDate}-to-${endDate}.pdf`);

        doc.pipe(res);
    } catch (error) {
        next(error);
    }
});

exportRouter.get('/excel', async (req, res, next) => {
    try {
        const query = dateRangeSchema.safeParse(req.query);
        if (!query.success) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
        }
        const { startDate, endDate } = query.data;

        const workbook = await ExportService.generateExcel(startDate, endDate);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=laporan-${startDate}-to-${endDate}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
});
