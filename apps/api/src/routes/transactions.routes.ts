import { Router, Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service.js';
import { z } from 'zod';
import { AppError } from '../middleware/error-handler.js';
import { authMiddleware } from '../middleware/auth.js';

const router: Router = Router();

const createTransactionSchema = z.object({
    type: z.enum(['income', 'expense']),
    categoryId: z.string().optional().nullable(),
    donationTargetId: z.string().optional().nullable(),
    amount: z.number().positive(),
    description: z.string().optional(),
    donorName: z.string().optional(),
    isAnonymous: z.boolean().optional().default(false),
    status: z.enum(['paid', 'processing']).optional().default('paid'),
    transactionDate: z.string(),
    receiptUrl: z.string().optional(),
});

const updateTransactionSchema = createTransactionSchema.partial();

const querySchema = z.object({
    type: z.enum(['income', 'expense']).optional(),
    categoryId: z.string().uuid().optional(),
    status: z.enum(['paid', 'processing']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().max(10000).optional().default(10),
});

// Get all transactions with filters and pagination
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = querySchema.parse(req.query);
        const result = await transactionService.getAll(query);

        res.json({
            success: true,
            data: result.transactions,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
});

// Get single transaction
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transaction = await transactionService.getById(req.params.id as string);

        res.json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        next(error);
    }
});

// Create transaction
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = createTransactionSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.format()
            });
            return;
        }

        const userId = (req as any).user?.id;
        const transaction = await transactionService.create(validation.data, userId);

        res.status(201).json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        next(error);
    }
});

// Update transaction
router.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = updateTransactionSchema.safeParse(req.body);
        if (!validation.success) {
            throw new AppError(400, 'Invalid transaction data');
        }

        const transaction = await transactionService.update(req.params.id as string, validation.data);

        res.json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        next(error);
    }
});

// Delete transaction
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await transactionService.delete(req.params.id as string);

        res.json({
            success: true,
            message: 'Transaction deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

// Upload receipt
router.post('/:id/receipt', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Cloudinary upload handling would go here
        // For now, just accept a URL
        const { receiptUrl } = req.body;

        const transaction = await transactionService.updateReceipt(req.params.id as string, receiptUrl);

        res.json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
