import { Router, Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service.js';

const router: Router = Router();

// Get all categories
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = req.query.type as 'income' | 'expense' | undefined;
        const categories = await categoryService.getAll(type);

        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
});

// Create new category
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, type, monthlyBudget } = req.body;

        if (!name || !type) {
            throw new Error('Name and type are required');
        }

        const category = await categoryService.create({ name, type, monthlyBudget });

        res.status(201).json({
            success: true,
            data: category,
        });
    } catch (error) {
        next(error);
    }
});



// Update category
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, type, monthlyBudget } = req.body;
        const category = await categoryService.update(req.params.id as string, { name, type, monthlyBudget });

        res.json({
            success: true,
            data: category,
        });
    } catch (error) {
        next(error);
    }
});

// Delete category
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await categoryService.delete(req.params.id as string);

        res.json({
            success: true,
            message: 'Category deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

// Get category by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await categoryService.getById(req.params.id as string);

        res.json({
            success: true,
            data: category,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
