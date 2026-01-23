import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path'; // Moved to top
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { router } from './routes/index.js';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

import type { Express } from 'express';

export const app: Express = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow serving images/files to other origins
    contentSecurityPolicy: false, // Disable strict CSP to allow simple embedding for now
    xFrameOptions: false, // Disable X-Frame-Options to allow iframe embedding of PDFs
}));

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());

        // Debug logging
        if (origin && !allowedOrigins.includes(origin)) {
            console.log('⚠️ CORS Blocked: ' + origin);
            console.log('allowedOrigins: ' + JSON.stringify(allowedOrigins));
        }

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Cookie parsing
app.use(cookieParser());

// Request logging
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
// Serve from project root/uploads
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

app.get('/', (req, res) => {
    res.json({
        message: 'Alumni Finance API is running 🚀',
        environment: env.NODE_ENV,
        endpoints: {
            health: '/health',
            api: '/api'
        }
    });
});

// API routes
app.all("/api/auth/*", toNodeHandler(auth));
app.use('/api', router);

// Error handling
app.use(errorHandler);
