import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { router } from './routes/index.js';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

import type { Express } from 'express';

export const app: Express = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "blob:"],
            connectSrc: ["'self'", ...env.CORS_ORIGIN.split(',').map(o => o.trim())],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            frameSrc: ["'self'", "https://app.midtrans.com", "https://app.sandbox.midtrans.com"],
        },
    },
    xFrameOptions: { action: "sameorigin" },
}));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env.NODE_ENV === 'development' ? 10000 : 100, // Limit each IP to 100 requests per windowMs (10000 in dev)
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// CORS configuration - strict in production, permissive in development
app.use(cors({
    origin: env.NODE_ENV === 'production'
        ? env.CORS_ORIGIN.split(',').map(o => o.trim())
        : true,
    credentials: true,
}));

// Cookie parsing
app.use(cookieParser());

// Request logging
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
    setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', env.CORS_ORIGIN);
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Custom short verify endpoint - workaround for Railway blocking /api/auth/verify-email
app.get('/api/verify', (req, res) => {
    const { token, callbackURL } = req.query;
    const verifyUrl = `/api/auth/verify-email?token=${token}&callbackURL=${callbackURL}`;
    req.url = verifyUrl;
    req.originalUrl = verifyUrl;
    return toNodeHandler(auth)(req, res);
});

app.get('/', (req, res) => {
    res.json({
        message: 'Alumni Finance API is running',
        environment: env.NODE_ENV,
        endpoints: {
            health: '/health',
            api: '/api'
        }
    });
});

// API routes - Better Auth handler
app.all("/api/auth/*", toNodeHandler(auth));
app.use('/api', router);

// Error handling
app.use(errorHandler);

export default app;
