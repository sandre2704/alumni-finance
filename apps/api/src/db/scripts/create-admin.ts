/**
 * Script untuk membuat user admin dengan password (better-auth compatible)
 * Jalankan: npx tsx src/db/scripts/create-admin.ts
 */

import { db } from '../index.js';
import { user, account } from '../schema/auth.js';
import { eq } from 'drizzle-orm';
import { scryptSync, randomBytes } from 'crypto';

// Kredensial Admin - GANTI SESUAI KEBUTUHAN
const ADMIN_EMAIL = 'admin@alumnifinance.com';
const ADMIN_PASSWORD = 'admin123';  // Password untuk login
const ADMIN_USERNAME = 'admin';
const ADMIN_NAME = 'Bendahara Alumni';

/**
 * Hash password menggunakan format yang sama dengan better-auth
 * better-auth menggunakan scrypt dengan format: salt:derivedKey (hex encoded)
 */
function hashPassword(password: string): string {
    const salt = randomBytes(16);
    // Use compatible scrypt parameters
    const derivedKey = scryptSync(password, salt, 64, {
        N: 16384,  // 2^14
        r: 8,      // block size
        p: 1,      // parallelization
        maxmem: 128 * 16384 * 8 * 2, // Required memory
    });
    return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

async function createAdmin() {
    console.log('🔐 Creating admin user...');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`👤 Username: ${ADMIN_USERNAME}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log('');

    try {
        // Check if user exists
        const existingUser = await db.query.user.findFirst({
            where: eq(user.email, ADMIN_EMAIL)
        });

        let adminId: string;

        if (existingUser) {
            console.log('⚠️  User already exists, updating...');
            adminId = existingUser.id;

            // Update user role to admin
            await db.update(user)
                .set({
                    role: 'admin',
                    emailVerified: true,
                    username: ADMIN_USERNAME,
                    name: ADMIN_NAME,
                    updatedAt: new Date()
                })
                .where(eq(user.id, adminId));
        } else {
            console.log('✨ Creating new user...');
            adminId = crypto.randomUUID();

            await db.insert(user).values({
                id: adminId,
                email: ADMIN_EMAIL,
                name: ADMIN_NAME,
                username: ADMIN_USERNAME,
                emailVerified: true,
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        // Delete existing credential account if exists
        await db.delete(account).where(eq(account.userId, adminId));

        // Create password account (credential provider)
        const hashedPassword = hashPassword(ADMIN_PASSWORD);
        console.log('🔒 Password hash created');

        await db.insert(account).values({
            id: crypto.randomUUID(),
            accountId: adminId,
            providerId: 'credential',
            userId: adminId,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log('');
        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('📝 Login dengan:');
        console.log(`   Email/Username: ${ADMIN_EMAIL} atau ${ADMIN_USERNAME}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
