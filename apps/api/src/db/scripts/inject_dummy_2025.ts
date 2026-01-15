import { db } from '../index.js';
import { categories } from '../schema/categories.js';
import { users } from '../schema/users.js';
import { transactions } from '../schema/transactions.js';
import { eq } from 'drizzle-orm';

async function injectData() {
    console.log('💉 Injecting dummy data for Oct-Dec 2025...');

    // 1. Get Categories
    const incomeCategories = await db.select().from(categories).where(eq(categories.type, 'income'));
    const expenseCategories = await db.select().from(categories).where(eq(categories.type, 'expense'));

    if (incomeCategories.length === 0 || expenseCategories.length === 0) {
        console.error('❌ Categories not found. Please seed categories first.');
        process.exit(1);
    }

    // 2. Get Admin User for createdBy
    const admin = await db.query.users.findFirst({
        where: eq(users.role, 'admin')
    });

    if (!admin) {
        console.error('❌ Admin user not found. Please seed users first.');
        process.exit(1);
    }

    const createdBy = admin.id;

    // Helper to get random item from array
    const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    // 3. Generate Transactions
    const dummyTransactions = [];

    // 10 Income Transactions
    const incomeDescriptions = [
        'Donasi Alumni Angkatan 90', 'Sponsorship Event Akhir Tahun', 'Iuran Anggota Oktober',
        'Donasi Pembangunan Masjid', 'Sumbangan Buku Perpustakaan', 'Iuran Anggota November',
        'Sponsorship Web Alumni', 'Lelang Amal', 'Iuran Anggota Desember', 'Donasi Pendidikan'
    ];

    for (let i = 0; i < 10; i++) {
        const month = Math.floor(Math.random() * 3) + 10; // 10, 11, 12
        const day = Math.floor(Math.random() * 28) + 1;
        // Format date YYYY-MM-DD
        const dateStr = `2025-${month}-${day.toString().padStart(2, '0')}`;

        const category = getRandom(incomeCategories);
        const amount = (Math.floor(Math.random() * 100) + 1) * 50000; // 50k - 5M

        dummyTransactions.push({
            type: 'income',
            categoryId: category.id,
            amount: amount.toString(),
            description: incomeDescriptions[i] || `Income Transaction ${i + 1}`,
            donorName: `Alumni ${i + 1}`,
            isAnonymous: Math.random() > 0.8,
            status: 'paid',
            transactionDate: dateStr,
            createdBy,
        });
    }

    // 10 Expense Transactions
    const expenseDescriptions = [
        'Konsumsi Rapat Pengurus', 'Cetak Proposal Event', 'Biaya Hosting Web',
        'Bantuan Sosial Alumni', 'Perlengkapan Kantor', 'Konsumsi Event',
        'Biaya Transportasi', 'Honor Pembicara', 'Dekorasi Event', 'Pembelian Souvenir'
    ];

    for (let i = 0; i < 10; i++) {
        const month = Math.floor(Math.random() * 3) + 10; // 10, 11, 12
        const day = Math.floor(Math.random() * 28) + 1;
        const dateStr = `2025-${month}-${day.toString().padStart(2, '0')}`;

        const category = getRandom(expenseCategories);
        const amount = (Math.floor(Math.random() * 50) + 1) * 20000; // 20k - 1M

        dummyTransactions.push({
            type: 'expense',
            categoryId: category.id,
            amount: amount.toString(),
            description: expenseDescriptions[i] || `Expense Transaction ${i + 1}`,
            status: 'paid',
            transactionDate: dateStr,
            createdBy,
        });
    }

    // 4. Insert into DB
    console.log(`📝 Inserting ${dummyTransactions.length} transactions...`);

    // Insert in chunks or all at once? All at once is fine for 20.
    await db.insert(transactions).values(dummyTransactions as any);

    console.log('✅ Dummy data injected successfully!');
    process.exit(0);
}

injectData().catch((err) => {
    console.error('❌ Injection failed:', err);
    process.exit(1);
});
