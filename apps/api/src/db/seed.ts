import { db } from './index.js';
import { categories } from './schema/categories.js';
import { user, account } from './schema/auth.js';
import { transactions } from './schema/transactions.js';
import { eq, and } from 'drizzle-orm';
import { auth } from '../lib/auth.js';

async function seed() {
    console.log('🌱 Seeding database...');

    // 1. Seed Categories
    console.log('📁 Seeding categories...');
    const incomeCats = [
        { id: crypto.randomUUID(), name: 'Iuran Wajib', slug: 'iuran_wajib', type: 'income' as const },
        { id: crypto.randomUUID(), name: 'Sumbangan', slug: 'sumbangan', type: 'income' as const },
        { id: crypto.randomUUID(), name: 'Sponsor', slug: 'sponsor', type: 'income' as const },
    ];
    const expenseCats = [
        { id: crypto.randomUUID(), name: 'Operasional', slug: 'operasional', type: 'expense' as const },
        { id: crypto.randomUUID(), name: 'Perlengkapan', slug: 'perlengkapan', type: 'expense' as const },
        { id: crypto.randomUUID(), name: 'Konsumsi', slug: 'konsumsi', type: 'expense' as const },
    ];

    await db.insert(categories).values([...incomeCats, ...expenseCats]).onConflictDoNothing();

    // Helper to get category ID
    const getCatId = async (name: string) => {
        const cat = await db.query.categories.findFirst({ where: eq(categories.name, name) });
        return cat?.id;
    };

    // 2. Seed Users
    console.log('👤 Seeding users...');

    // Admin Credentials
    const adminEmail = 'admin@alumnifinance.com';
    const adminPassword = 'password123';
    const adminName = 'Bendahara Alumni';

    let adminUser;

    // cleanup: Check if user exists but has no account (password)
    const existingUser = await db.query.user.findFirst({
        where: eq(user.email, adminEmail)
    });

    if (existingUser) {
        const existingAccount = await db.query.account.findFirst({
            where: eq(account.userId, existingUser.id)
        });

        if (!existingAccount) {
            console.log('⚠️ Found admin user without password (clean or old seed). Recreating...');
            // Delete linked transactions first to avoid foreign key constraints
            await db.delete(transactions).where(eq(transactions.createdBy, existingUser.id));
            // Delete the 'zombie' user so we can create a fresh one with password
            await db.delete(user).where(eq(user.id, existingUser.id));
        } else {
            // If account exists, force recreate to guarantee 'password123' works.
            console.log('🔄 Recreating admin user to ensure default credentials...');
            await db.delete(transactions).where(eq(transactions.createdBy, existingUser.id));
            await db.delete(account).where(eq(account.userId, existingUser.id));
            await db.delete(user).where(eq(user.id, existingUser.id));
        }
    }

    try {
        console.log(`Creation admin user: ${adminEmail}`);

        const result = await auth.api.signUpEmail({
            body: {
                email: adminEmail,
                password: adminPassword,
                name: adminName,
                role: 'admin',
                username: 'admin',
                profileCompleted: true,
            }
        });

        if (result && result.user) {
            adminUser = result.user;
            console.log('Admin user created via auth.');
        }

    } catch (e: any) {
        // If it fails, maybe user exists (race condition or other issue). 
        console.log('Admin creation note:', e.message || e);
    }

    if (!adminUser) {
        // Try to fetch again
        const existing = await db.select().from(user).where(eq(user.email, adminEmail)).limit(1);
        if (existing.length > 0) {
            adminUser = existing[0];
        }
    }

    if (!adminUser) {
        console.error('❌ Failed to create or find admin user. Transactions will not be seeded.');
        process.exit(1);
    }

    // Force Admin Role & Verification & Profile Completed
    await db.update(user)
        .set({
            role: 'admin',
            emailVerified: true,
            isActive: true,
            profileCompleted: true,
            updatedAt: new Date()
        })
        .where(eq(user.id, adminUser.id));

    console.log(`✅ Admin Ready: ${adminEmail} / ${adminPassword}`);

    // Members (Guests)
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
            createdBy: adminUser.id, // Linked to Admin
        });
    }

    console.log('🎉 Database seeded successfully with frontend data!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
