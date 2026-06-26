import { Router, Request, Response, NextFunction } from 'express';
import { feedbackService } from '../services/feedback.service.js';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';
import { z } from 'zod';

const router: Router = Router();

// Middleware to check if user is admin
const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        throw new AppError(403, 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.');
    }
    next();
};

const createFeedbackSchema = z.object({
    name: z.string().optional(),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    isAnonymous: z.boolean(),
    message: z.string().min(1, 'Pesan tidak boleh kosong'),
    category: z.enum(['kategori_baru', 'fitur', 'kritik', 'lainnya']),
});

// Submit feedback (Public)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = createFeedbackSchema.safeParse(req.body);
        if (!validation.success) {
            const errorMessage = validation.error.errors.map(e => e.message).join(', ');
            throw new AppError(400, errorMessage);
        }

        const feedback = await feedbackService.create(validation.data);
        res.status(201).json({
            success: true,
            data: feedback,
        });
    } catch (error) {
        next(error);
    }
});

// Get all feedbacks (Admin only)
router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status as 'pending' | 'approved' | 'rejected' | 'all' | undefined;
        // Filter out 'all' from client side
        const validStatus = status === 'all' ? undefined : status;

        const feedbacks = await feedbackService.getAll(validStatus as any);
        res.json({
            success: true,
            data: feedbacks,
        });
    } catch (error) {
        next(error);
    }
});

// Update status (Admin only)
router.put('/:id/status', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            throw new AppError(400, 'Status tidak valid');
        }

        const feedback = await feedbackService.updateStatus(req.params.id as string, status);
        res.json({
            success: true,
            data: feedback,
        });
    } catch (error) {
        next(error);
    }
});

// Mark as read (Admin only)
router.put('/:id/read', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const feedback = await feedbackService.markAsRead(req.params.id as string);
        res.json({
            success: true,
            data: feedback,
        });
    } catch (error) {
        next(error);
    }
});

// Get unread count (Admin only)
router.get('/unread-count', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const count = await feedbackService.getUnreadCount();
        res.json({
            success: true,
            data: count,
        });
    } catch (error) {
        next(error);
    }
});


export default router;
