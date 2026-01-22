import { Router, Request, Response, NextFunction } from 'express';
import { donationTargetService } from '../services/donation-target.service.js';
import { z } from 'zod';
import { AppError } from '../middleware/error-handler.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

const createTargetSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    targetAmount: z.number().positive(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

const updateTargetSchema = createTargetSchema.partial().extend({
    isActive: z.boolean().optional(),
    currentAmount: z.number().optional(),
});

// Get all donation targets
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const targets = await donationTargetService.getAll();

        res.json({
            success: true,
            data: targets,
        });
    } catch (error) {
        next(error);
    }
});

// Get active donation target
router.get('/active', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const target = await donationTargetService.getActive();

        res.json({
            success: true,
            data: target,
        });
    } catch (error) {
        next(error);
    }
});

// Get donation target donors
router.get('/:id/donors', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await donationTargetService.getDonors(req.params.id, req.query);

        res.json({
            success: true,
            data: result.data,
            meta: result.meta,
            stats: result.stats
        });
    } catch (error) {
        next(error);
    }
});

// Get single donation target
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const target = await donationTargetService.getById(req.params.id);

        res.json({
            success: true,
            data: target,
        });
    } catch (error) {
        next(error);
    }
});

// Create donation target
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = createTargetSchema.safeParse(req.body);
        if (!validation.success) {
            throw new AppError(400, 'Invalid donation target data');
        }

        const target = await donationTargetService.create(validation.data);

        res.status(201).json({
            success: true,
            data: target,
        });
    } catch (error) {
        next(error);
    }
});

// Update donation target
router.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = updateTargetSchema.safeParse(req.body);
        if (!validation.success) {
            throw new AppError(400, 'Invalid donation target data');
        }

        const target = await donationTargetService.update(req.params.id, validation.data);

        res.json({
            success: true,
            data: target,
        });
    } catch (error) {
        next(error);
    }
});

// Delete donation target
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await donationTargetService.delete(req.params.id);

        res.json({
            success: true,
            message: 'Donation target deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
