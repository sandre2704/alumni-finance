
import { db } from '../db';

async function main() {
    console.log('Fetching transactions from database...');
    try {

        const categories = await db.query.categories.findMany();
        const categoryMap = new Map(categories.map(c => [c.id, c.name]));

        const transactions = await db.query.transactions.findMany({
            orderBy: (transactions, { desc }) => [desc(transactions.transactionDate)],
            limit: 20
        });

        if (transactions.length === 0) {
            console.log('No transactions found in database.');
        } else {
            console.table(transactions.map(t => ({
                ID: t.id.substring(0, 8) + '...',
                Date: new Date(t.transactionDate).toLocaleDateString('id-ID'),
                Type: t.type,
                Category: categoryMap.get(t.categoryId || '') || '-',
                Amount: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(t.amount)),
                Name: t.donorName || t.description || '-'
            })));
        }
    } catch (err) {
        console.error('Error fetching transactions:', err);
    }
    process.exit(0);
}

main();
