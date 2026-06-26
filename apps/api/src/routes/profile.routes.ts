import { Router, Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profile.service.js';
import { auth } from '../lib/auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import { AuthUser } from '../types/index.js';

const router: Router = Router();

/**
 * Middleware to get current user from session
 */
async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });

        if (!session?.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.user = session.user as unknown as AuthUser;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

/**
 * POST /api/profile/complete
 * Complete profile with username and password
 */
router.post('/complete', getCurrentUser, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { username, password, confirmPassword } = req.body;

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ error: 'Username dan password wajib diisi' });
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Konfirmasi password tidak cocok' });
        }

        const result = await profileService.completeProfile(userId, { username, password });
        res.json({ success: true, user: result });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/profile/status
 * Get profile completion status
 */
router.get('/status', getCurrentUser, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const status = await profileService.getProfileStatus(userId);
        res.json(status);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/profile/check-username/:username
 * Check if username is available
 */
router.get('/check-username/:username', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.params;
        const available = await profileService.checkUsernameAvailable(username as string);
        res.json({ available });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/profile/get-email-by-username/:username
 * Get user email by username (for login with username)
 */
router.get('/get-email-by-username/:username', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.params;
        const result = await profileService.getEmailByUsername(username as string);
        if (result) {
            res.json({ email: result.email, isActive: result.isActive });
        } else {
            res.status(404).json({ error: 'Username tidak ditemukan' });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/profile/get-user-status-by-email/:email
 * Get user active status by email (for pre-login validation)
 */
router.get('/get-user-status-by-email/:email', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.params;
        const result = await profileService.getUserStatusByEmail(email as string);
        if (result) {
            res.json({ isActive: result.isActive });
        } else {
            // Return true if user not found (let better-auth handle the actual auth)
            res.json({ isActive: true });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/profile/change-password
 * Change user password
 */
router.post('/change-password', getCurrentUser, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validate
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'Semua field harus diisi' });
        }

        await profileService.changePassword(userId, { oldPassword, newPassword, confirmPassword });
        res.json({ success: true, message: 'Password berhasil diubah' });
    } catch (error) {
        next(error);
    }
});

export default router;

