import { app } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/index.js';

const PORT = parseInt(env.PORT, 10);

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
    console.log(`${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
        console.log('HTTP server closed.');

        try {
            await pool.end();
            console.log('Database pool closed.');
        } catch (err) {
            console.error('Error closing database pool:', err);
        }

        process.exit(0);
    });

    // Force shutdown after 10s if graceful shutdown fails
    setTimeout(() => {
        console.error('Graceful shutdown timed out, forcing exit.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));