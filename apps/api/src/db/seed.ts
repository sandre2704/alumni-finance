import { db } from './index.js';
import { categories } from './schema/categories.js';
import { user, account } from './schema/auth.js';
import { transactions } from './schema/transactions.js';
import { eq } from 'drizzle-orm';

async function seed() {
    console.log('🌱 Seeding database...');

    // 1. Seed Categories
    console.log('📁 Seeding categories...');
    const incomeCats = [
        { name: 'Iuran Wajib', slug: 'iuran_wajib', type: 'income' as const },
        { name: 'Sumbangan', slug: 'sumbangan', type: 'income' as const },
        { name: 'Sponsor', slug: 'sponsor', type: 'income' as const },
    ];
    const expenseCats = [
        { name: 'Operasional', slug: 'operasional', type: 'expense' as const },
        { name: 'Perlengkapan', slug: 'perlengkapan', type: 'expense' as const },
        { name: 'Konsumsi', slug: 'konsumsi', type: 'expense' as const },
    ];

    await db.insert(categories).values([...incomeCats, ...expenseCats]).onConflictDoNothing();

    // Helper to get category ID
    const getCatId = async (name: string) => {
        const cat = await db.query.categories.findFirst({ where: eq(categories.name, name) });
        return cat?.id;
    };

    // 2. Seed Users
    console.log('👤 Seeding users...');
    // better-auth uses scrypt/argon2, but we can't easily generate that here without imports.
    // For now, we will seed users without password capability or use a known hash if possible.
    // Alternatively, we skip password seeding and expect OAuth or manual reset.
    // We will insert into 'user' table only for now, as 'account' requires proper provider structure.

    // Admin
    const [admin] = await db.insert(user).values({
        id: crypto.randomUUID(),
        username: 'admin',
        email: 'admin@alumnifinance.com',
        name: 'Bendahara Alumni',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'admin',
    }).onConflictDoUpdate({ target: user.email, set: { name: 'Bendahara Alumni', username: 'admin' } }).returning();

    // Members
    const members = [
        { email: 'budi@alumni.com', name: 'Budi Santoso', username: 'budi' },
        { email: 'siti@alumni.com', name: 'Siti Aminah', username: 'siti' },
        { email: 'ahmad@alumni.com', name: 'Ahmad Dhani', username: 'ahmad' },
    ];

    const memberMap = new Map();
    for (const m of members) {
        const [newUser] = await db.insert(user).values({
            id: crypto.randomUUID(),
            username: m.username,
            email: m.email,
            name: m.name,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            role: 'guest',
        }).onConflictDoUpdate({ target: user.email, set: { name: m.name, username: m.username } }).returning();
        memberMap.set(m.name, newUser.id);
    }

    // 3. Seed Transactions
    console.log('💸 Seeding transactions...');

    const txData = [
        {
            date: '2023-10-24',
            description: 'Iuran Tahunan 2023',
            category: 'Iuran Wajib',
            donor: 'Budi Santoso',
            amount: 500000,
            type: 'income',
            status: 'paid'
        },
        {
            date: '2023-10-22',
            description: 'Donasi Reuni Akbar',
            category: 'Sumbangan',
            donor: 'Siti Aminah',
            amount: 1500000,
            type: 'income',
            status: 'paid'
        },
        {
            date: '2023-10-20',
            description: 'Sewa Gedung Pertemuan',
            category: 'Operasional',
            donor: null,
            amount: 2500000,
            type: 'expense',
            status: 'processing'
        },
        {
            date: '2023-10-18',
            description: 'Iuran Bulanan',
            category: 'Iuran Wajib',
            donor: 'Ahmad Dhani',
            amount: 100000,
            type: 'income',
            status: 'paid'
        },
        {
            date: '2023-10-15',
            description: 'Cetak Banner Acara',
            category: 'Perlengkapan',
            donor: null,
            amount: 350000,
            type: 'expense',
            status: 'paid'
        }
    ];

    for (const tx of txData) {
        const catId = await getCatId(tx.category);
        if (!catId) continue;

        await db.insert(transactions).values({
            type: tx.type as 'income' | 'expense',
            categoryId: catId,
            amount: tx.amount.toString(), // decimals as string
            description: tx.description,
            donorName: tx.donor || undefined,
            status: tx.status as 'paid' | 'processing',
            transactionDate: tx.date,
            createdBy: admin.id, // Admin created these records
        });
    }

    console.log('🎉 Database seeded successfully with frontend data!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
