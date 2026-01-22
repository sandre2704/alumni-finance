import { Router, Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';
import { z } from 'zod';

const router = Router();

// Middleware to check if user is admin
const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
        throw new AppError(403, 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.');
    }
    next();
};

const createUserSchema = z.object({
    username: z.string().min(3, 'Username minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    name: z.string().min(1, 'Nama tidak boleh kosong'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
});

const updateUserSchema = z.object({
    username: z.string().min(3, 'Username minimal 3 karakter').optional(),
    email: z.string().email('Format email tidak valid').optional(),
    name: z.string().min(1, 'Nama tidak boleh kosong').optional(),
    password: z.string().min(6, 'Password minimal 6 karakter').optional(),
    isActive: z.boolean().optional(),
    role: z.string().optional(),
});

// Get all non-admin users (admin only)
router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userService.getNonAdminUsers();
        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
});

// Get user by ID (admin only)
router.get('/:id', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getById(req.params.id);
        if (!user) {
            throw new AppError(404, 'User tidak ditemukan');
        }
        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
});

// Create new user (admin only)
router.post('/', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = createUserSchema.safeParse(req.body);
        if (!validation.success) {
            const errorMessage = validation.error.errors.map(e => e.message).join(', ');
            throw new AppError(400, errorMessage);
        }

        const user = await userService.create(validation.data);
        res.status(201).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
});

// Update user (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = updateUserSchema.safeParse(req.body);
        if (!validation.success) {
            const errorMessage = validation.error.errors.map(e => e.message).join(', ');
            throw new AppError(400, errorMessage);
        }

        const user = await userService.update(req.params.id, validation.data);
        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await userService.delete(req.params.id);
        res.json({
            success: true,
            message: 'User berhasil dihapus',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
