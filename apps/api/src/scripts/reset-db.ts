import { Pool } from 'pg';
import { env } from '../config/env.js';

async function reset() {
    console.log('🗑️ Resetting database...');

    const pool = new Pool({
        connectionString: env.DATABASE_URL,
    });

    try {
        await pool.query('DROP SCHEMA public CASCADE;');
        await pool.query('CREATE SCHEMA public;');
        await pool.query('GRANT ALL ON SCHEMA public TO public;');
        await pool.query('COMMENT ON SCHEMA public IS \'standard public schema\';');
        console.log('✅ Database reset successfully');
    } catch (error) {
        console.error('❌ Reset failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

reset();
