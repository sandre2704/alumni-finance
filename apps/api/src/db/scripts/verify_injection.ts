import { db } from '../index.js';
import { transactions } from '../schema/transactions.js';
import { sql } from 'drizzle-orm';

async function verify() {
    console.log('🔍 Verifying injected data...');

    const result = await db.execute(sql`
        SELECT 
            EXTRACT(MONTH FROM transaction_date) as month,
            type,
            COUNT(*) as count,
            SUM(amount) as total
        FROM transactions
        WHERE EXTRACT(YEAR FROM transaction_date) = 2025
        GROUP BY 1, 2
        ORDER BY 1, 2;
    `);

    console.table(result.rows);
    process.exit(0);
}

verify().catch(console.error);
