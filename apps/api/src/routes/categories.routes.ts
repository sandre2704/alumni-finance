import { Router, Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service.js';
import { z } from 'zod';
import { sendSuccess, sendCreated } from '../lib/api-response.js';
import { AppError } from '../middleware/error-handler.js';

const router: Router = Router();

const createCategorySchema = z.object({
    name: z.string().min(1, 'Nama kategori wajib diisi'),
    type: z.enum(['income', 'expense']),
    monthlyBudget: z.number().min(0).optional().default(0),
});

const updateCategorySchema = createCategorySchema.partial();

// Get all categories
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = req.query.type as 'income' | 'expense' | undefined;
        const categories = await categoryService.getAll(type);

        sendSuccess(res, categories);
    } catch (error) {
        next(error);
    }
});

// Create new category
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = createCategorySchema.safeParse(req.body);
        
        if (!validation.success) {
            const errorMessage = validation.error.errors.map(e => e.message).join(', ');
            throw new AppError(400, errorMessage);
        }

        const category = await categoryService.create({
            ...validation.data,
            monthlyBudget: validation.data.monthlyBudget?.toString()
        });

        sendCreated(res, category);
    } catch (error) {
        next(error);
    }
});



// Update category
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = updateCategorySchema.safeParse(req.body);
        if (!validation.success) {
            const errorMessage = validation.error.errors.map(e => e.message).join(', ');
            throw new AppError(400, errorMessage);
        }

        const category = await categoryService.update(req.params.id as string, {
            ...validation.data,
            monthlyBudget: validation.data.monthlyBudget?.toString()
        });

        sendSuccess(res, category);
    } catch (error) {
        next(error);
    }
});

// Delete category
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await categoryService.delete(req.params.id as string);

        sendSuccess(res, null, 'Category deleted successfully');
    } catch (error) {
        next(error);
    }
});

// Get category by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await categoryService.getById(req.params.id as string);

        sendSuccess(res, category);
    } catch (error) {
        next(error);
    }
});

export default router;
