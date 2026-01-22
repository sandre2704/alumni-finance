
import { db } from '../db/index.js';
import { transactions } from '../db/schema/transactions.js';
import { lte } from 'drizzle-orm';

async function main() {
    console.log('Cleaning up dummy transactions (older than 2025)...');
    try {
        // Delete transactions where transactionDate is before 2025-01-01
        // Seed data is from 2023. User data is 2026.
        const result = await db.delete(transactions)
            .where(lte(transactions.transactionDate, '2024-12-31'))
            .returning();

        console.log(`Successfully deleted ${result.length} dummy transactions.`);
    } catch (err) {
        console.error('Error cleaning transactions:', err);
    }
    process.exit(0);
}

main();
