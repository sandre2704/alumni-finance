import { db } from '../index.js';
import { categories } from '../schema/categories.js';
import { user } from '../schema/index.js';
import { transactions } from '../schema/transactions.js';
import { eq } from 'drizzle-orm';

async function injectJan2026Data() {
    console.log('💉 Injecting dummy data for Jan 2-8, 2026...');

    // 1. Get Categories
    const incomeCategories = await db.select().from(categories).where(eq(categories.type, 'income'));
    const expenseCategories = await db.select().from(categories).where(eq(categories.type, 'expense'));

    if (incomeCategories.length === 0 || expenseCategories.length === 0) {
        console.error('❌ Categories not found. Please seed categories first.');
        process.exit(1);
    }

    // 2. Get Admin User for createdBy
    const admin = await db.query.user.findFirst({
        where: eq(user.role, 'admin')
    });

    if (!admin) {
        console.error('❌ Admin user not found. Please seed users first.');
        process.exit(1);
    }

    const createdBy = admin.id;
    const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const dummyTransactions = [];

    // Dates: Jan 2, 3, 4, 5, 6, 7, 8 (2026)
    const dates = ['2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08'];

    // 10 Income Transactions - distributed across dates
    const incomeDescriptions = [
        'Donasi Alumni A', 'Sponsorship Event', 'Iuran Anggota Baru',
        'Donasi Pendidikan', 'Sumbangan Buku', 'Iuran Bulanan',
        'Sponsorship Web', 'Donasi Anonim', 'Iuran Tahunan', 'Donasi Reuni'
    ];

    for (let i = 0; i < 10; i++) {
        const dateStr = dates[i % dates.length]; // Cycle through dates
        const category = getRandom(incomeCategories);
        const amount = (Math.floor(Math.random() * 50) + 5) * 100000; // 500k - 5M

        dummyTransactions.push({
            type: 'income',
            categoryId: category.id,
            amount: amount.toString(),
            description: incomeDescriptions[i],
            donorName: `Donatur ${i + 1}`,
            isAnonymous: false,
            status: 'paid',
            transactionDate: dateStr,
            createdBy,
        });
    }

    // 10 Expense Transactions - distributed across dates
    const expenseDescriptions = [
        'Konsumsi Rapat', 'Cetak Proposal', 'Biaya Hosting',
        'Bantuan Sosial', 'Perlengkapan Kantor', 'Konsumsi Event',
        'Biaya Transport', 'Honor Pembicara', 'Dekorasi Acara', 'Souvenir'
    ];

    for (let i = 0; i < 10; i++) {
        const dateStr = dates[i % dates.length]; // Cycle through dates
        const category = getRandom(expenseCategories);
        const amount = (Math.floor(Math.random() * 20) + 1) * 50000; // 50k - 1M

        dummyTransactions.push({
            type: 'expense',
            categoryId: category.id,
            amount: amount.toString(),
            description: expenseDescriptions[i],
            status: 'paid',
            transactionDate: dateStr,
            createdBy,
        });
    }

    // 4. Insert into DB
    console.log(`📝 Inserting ${dummyTransactions.length} transactions...`);
    await db.insert(transactions).values(dummyTransactions as any);

    console.log('✅ Dummy data for Jan 2-8 2026 injected successfully!');
    process.exit(0);
}

injectJan2026Data().catch((err) => {
    console.error('❌ Injection failed:', err);
    process.exit(1);
});
