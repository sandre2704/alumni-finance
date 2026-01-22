import { db } from '../index.js';
import { transactions } from '../schema/transactions.js';
import { desc } from 'drizzle-orm';

async function checkLatestTransaction() {
    try {
        const latest = await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(1);

        if (latest.length > 0) {
            console.log('Latest Transaction:');
            console.log('ID:', latest[0].id);
            console.log('Type:', latest[0].type);
            console.log('Receipt URL:', latest[0].receiptUrl);
        } else {
            console.log('No transactions found.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        process.exit(1);
    }
}

checkLatestTransaction();
