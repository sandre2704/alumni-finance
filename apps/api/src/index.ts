// Force restart - timestamp: 2026-01-14 (Debug Admin Role)
import { app } from './app.js';
import { env } from './config/env.js';

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
    console.log('🔄 Server restarted at ' + new Date().toLocaleTimeString());
});