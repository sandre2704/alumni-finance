
import { db } from '../index.js';
import { transactions } from '../schema/transactions.js';
import { categories } from '../schema/categories.js';
import { user } from '../schema/auth.js';
import { eq } from 'drizzle-orm';
import { date } from 'drizzle-orm/pg-core';

async function seedTransactions() {
    console.log('🌱 Seeding dummy transactions...');

    // 1. Get Admin User
    const admin = await db.query.user.findFirst({
        where: eq(user.username, 'admin')
    });

    if (!admin) {
        console.error('❌ Admin user not found. Please run main seed first.');
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
        console.error('❌ Categories not found. Please run main seed first.');
        process.exit(1);
    }

    const months = [];
    // Generate for all months in 2025 (Jan-Dec)
    for (let i = 0; i < 12; i++) {
        months.push({ year: 2025, month: i });
    }
    // Note: Previous request was Nov 2025 - Jan 2026. 
    // If we want to strictly add "Jan 2025 to Dec 2025", we just add those.
    // If the user meant to *also* keep Jan 2026, we should perhaps leave it or just follow the strict instruction "tambahkan lagi data dari januari 2025 sampai desember 2025".
    // I will focus on the explicit request: Jan 2025 - Dec 2025.

    const generatedTransactions = [];

    for (const { year, month } of months) {
        console.log(`Generating for ${year}-${month + 1}...`);

        // Generate 10 Income
        for (let i = 0; i < 10; i++) {
            const randomCategory = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
            const day = Math.floor(Math.random() * 28) + 1; // Avoid end of month issues
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const amount = Math.floor(Math.random() * 1000000) + 50000; // 50k - 1.05m

            generatedTransactions.push({
                type: 'income' as const,
                categoryId: randomCategory.id,
                amount: amount.toString(),
                description: `Dummy Income ${i + 1} - ${randomCategory.name}`,
                donorName: 'Anonymous Donor',
                status: 'paid' as const,
                transactionDate: dateStr,
                createdBy: admin.id,
                isAnonymous: false
            });
        }

        // Generate 10 Expense
        for (let i = 0; i < 10; i++) {
            const randomCategory = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
            const day = Math.floor(Math.random() * 28) + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const amount = Math.floor(Math.random() * 5000000) + 100000; // 100k - 5.1m

            generatedTransactions.push({
                type: 'expense' as const,
                categoryId: randomCategory.id,
                amount: amount.toString(),
                description: `Dummy Expense ${i + 1} - ${randomCategory.name}`,
                status: 'paid' as const,
                transactionDate: dateStr,
                createdBy: admin.id,
                isAnonymous: false
            });
        }
    }

    if (generatedTransactions.length > 0) {
        await db.insert(transactions).values(generatedTransactions);
        console.log(`✅ Successfully inserted ${generatedTransactions.length} transactions.`);
    } else {
        console.log('No transactions generated.');
    }

    process.exit(0);
}

seedTransactions().catch((err) => {
    console.error('❌ Transaction seed failed:', err);
    process.exit(1);
});
