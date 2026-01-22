import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadService } from '../services/upload.service.js';
import { AppError } from '../middleware/error-handler.js';
import { authMiddleware } from '../middleware/auth.js';

const router: Router = Router();

console.log('Registering Upload Routes...');

// Configure Multer (Memory Storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1 * 1024 * 1024, // 1MB limit
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
        }
    },
});

router.post('/', authMiddleware, upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new AppError(400, 'No file uploaded');
        }

        const result = await uploadService.uploadFile(req.file.buffer, req.file.originalname);

        res.json({
            success: true,
            data: {
                url: result.url,
            },
        });
    } catch (error) {

        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return next(new AppError(400, 'File size too large. Max 1MB.'));
            }
        }
        next(error);
    }
});

export default router;
