import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth.js';
import { fromNodeHeaders } from "better-auth/node";
import { AppError } from './error-handler.js';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });

        if (!session) {
            throw new AppError(401, 'Authentication required');
        }

        req.user = session.user as any;
        req.session = session.session as any;
        next();
    } catch (error) {
        next(error);
    }
};
