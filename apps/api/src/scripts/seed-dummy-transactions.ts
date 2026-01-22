import { db } from '../db/index.js';
import { transactions } from '../db/schema/transactions.js';
import { user } from '../db/schema/index.js';
import { categories } from '../db/schema/categories.js';
import { eq } from 'drizzle-orm';

async function seedDummyTransactions() {
    console.log('🚀 Starting dummy transaction injection...');

    // 1. Get Admin User
    const admin = await db.query.user.findFirst({
        where: eq(user.username, 'admin')
    });

    if (!admin) {
        console.error('❌ Admin user not found. Please run seed.ts first.');
        process.exit(1);
    }

    // 2. Get Categories
    const incomeCategories = await db.query.categories.findMany({
        where: eq(categories.type, 'income')
    });
    const expenseCategories = await db.query.categories.findMany({
        where: eq(categories.type, 'expense')
    });

    if (incomeCategories.length === 0 || expenseCategories.length === 0) {
        console.error('❌ Categories not found. Please run seed.ts first.');
        process.exit(1);
    }

    // Helper to get random item from array
    const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    // 3. Define Dummy Data (10 items)
    const dummyData = [
        // Income (6 items)
        { desc: 'Donasi Alumni Angkatan 2010', amount: '2500000', type: 'income', date: '2023-11-01' },
        { desc: 'Sponsorship Event Workshop', amount: '5000000', type: 'income', date: '2023-11-05' },
        { desc: 'Iuran Wajib Budi', amount: '100000', type: 'income', date: '2023-11-10' },
        { desc: 'Sumbangan Tanpa Nama', amount: '500000', type: 'income', date: '2023-11-12', anonymous: true },
        { desc: 'Iuran Wajib Siti', amount: '100000', type: 'income', date: '2023-11-15' },
        { desc: 'Donasi Pembangunan Masjid', amount: '10000000', type: 'income', date: '2023-11-20' },

        // Expense (4 items)
        { desc: 'Pembelian ATK', amount: '250000', type: 'expense', date: '2023-11-02' },
        { desc: 'Konsumsi Rapat Bulanan', amount: '500000', type: 'expense', date: '2023-11-08' },
        { desc: 'Bayar Listrik Sekretariat', amount: '1200000', type: 'expense', date: '2023-11-25' },
        { desc: 'Cetak Proposal Event', amount: '750000', type: 'expense', date: '2023-11-28' },
    ];

    console.log(`📝 Preparing to insert ${dummyData.length} transactions...`);

    for (const data of dummyData) {
        // Pick a random category based on type
        const categoryList = data.type === 'income' ? incomeCategories : expenseCategories;
        const category = getRandom(categoryList);

        await db.insert(transactions).values({
            type: data.type as 'income' | 'expense',
            categoryId: category.id,
            amount: data.amount,
            description: data.desc,
            transactionDate: data.date,
            createdBy: admin.id,
            status: 'paid',
            isAnonymous: data.anonymous || false,
            donorName: data.type === 'income' && !data.anonymous ? 'Hamba Allah' : undefined, // Simplification
        });
    }

    console.log('✅ Successfully injected 10 dummy transactions!');
    process.exit(0);
}

seedDummyTransactions().catch((err) => {
    console.error('❌ Injection failed:', err);
    process.exit(1);
});
