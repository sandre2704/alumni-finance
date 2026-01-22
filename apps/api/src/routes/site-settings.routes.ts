import { Router, Request, Response, NextFunction } from 'express';
import { SiteSettingsService } from '../services/site-settings.service';
import { authMiddleware } from '../middleware/auth';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';

const router = Router();

// GET /api/site-settings/transfer-info - Public endpoint
router.get('/transfer-info', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transferInfo = await SiteSettingsService.getTransferInfo();

        if (!transferInfo) {
            // Return empty default structure
            return res.json({
                bankAccounts: [],
                whatsappNumber: '',
                email: '',
                instructions: '',
                qrCodeUrl: '',
            });
        }

        res.json(transferInfo);
    } catch (error) {
        next(error);
    }
});

// PUT /api/site-settings/transfer-info - Admin only
router.put('/transfer-info', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check if user is admin
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });

        if (!session?.user || session.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { bankAccounts, whatsappNumber, email, instructions, qrCodeUrl } = req.body;

        const transferInfo = await SiteSettingsService.updateTransferInfo({
            bankAccounts: bankAccounts || [],
            whatsappNumber: whatsappNumber || '',
            email: email || '',
            instructions: instructions || '',
            qrCodeUrl: qrCodeUrl || '',
        });

        res.json(transferInfo);
    } catch (error) {
        next(error);
    }
});

export default router;
