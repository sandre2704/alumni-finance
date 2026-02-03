import { Router, Request, Response } from 'express';
import { MidtransService } from '../services/midtrans.service.js';

const router = Router();

/**
 * POST /api/donations/create
 * Create a new donation and get Snap token
 */
router.post('/create', async (req: Request, res: Response) => {
    try {
        const { donorName, donorEmail, amount, donationTargetId, categoryId, message, isAnonymous } = req.body;

        // Validation
        if (!donorName || !donorEmail || !amount) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        if (amount < 10000) {
            res.status(400).json({
                success: false,
                message: 'Minimal donasi Rp 10.000',
            });
            return;
        }

        const result = await MidtransService.createDonation({
            donorName: donorName || 'Anonim',
            donorEmail,
            amount: Number(amount),
            donationTargetId: donationTargetId || null,
            message,
            isAnonymous: isAnonymous || false,
        });

        res.json(result);
    } catch (error: any) {
        console.error('[Donation] Create error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Gagal membuat transaksi donasi',
        });
    }
});

/**
 * POST /api/donations/update-status
 * Update transaction status after payment (called from frontend)
 */
router.post('/update-status', async (req: Request, res: Response) => {
    try {
        const { transactionId, status } = req.body;

        if (!transactionId || !status) {
            res.status(400).json({
                success: false,
                message: 'Transaction ID dan status wajib diisi',
            });
            return;
        }

        if (!['paid', 'processing'].includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Status tidak valid',
            });
            return;
        }

        const updated = await MidtransService.updateTransactionStatus(transactionId, status);

        res.json({
            success: true,
            data: updated,
        });
    } catch (error: any) {
        console.error('[Donation] Update status error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Gagal mengupdate status transaksi',
        });
    }
});

/**
 * GET /api/donations/client-key
 * Get Midtrans client key for frontend
 */
router.get('/client-key', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            clientKey: MidtransService.getClientKey(),
            isProduction: MidtransService.isProduction(),
        },
    });
});

/**
 * POST /api/donations/notification
 * Webhook endpoint for Midtrans notifications
 */
router.post('/notification', async (req: Request, res: Response) => {
    try {
        const notification = req.body;
        console.log('[Midtrans Webhook] Received:', JSON.stringify(notification, null, 2));

        const result = await MidtransService.handleNotification(notification);

        res.json(result);
    } catch (error: any) {
        console.error('[Midtrans Webhook] Error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
