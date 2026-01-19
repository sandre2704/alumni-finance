/**
 * Script untuk menjadikan user terbaru sebagai admin
 * Jalankan: npx tsx src/db/scripts/make-admin.ts
 */

import { db } from '../index.js';
import { user } from '../schema/auth.js';
import { desc, eq } from 'drizzle-orm';

async function makeAdmin() {
    console.log('👑 Mencari user terbaru untuk dijadikan admin...');
    console.log('');

    try {
        // Get the most recent user
        const users = await db.select().from(user).orderBy(desc(user.createdAt));

        if (users.length === 0) {
            console.log('❌ Tidak ada user di database!');
            process.exit(1);
        }

        console.log('📋 Daftar semua user:');
        users.forEach((u, i) => {
            console.log(`   ${i + 1}. ${u.email} (${u.name}) - role: ${u.role || 'guest'}`);
        });
        console.log('');

        // Update the first (most recent) user to admin
        const targetUser = users[0];

        await db.update(user)
            .set({
                role: 'admin',
                emailVerified: true,
                updatedAt: new Date()
            })
            .where(eq(user.id, targetUser.id));

        console.log(`✅ User "${targetUser.email}" sekarang adalah ADMIN!`);
        console.log('');
        console.log('📝 Login dengan:');
        console.log(`   Email: ${targetUser.email}`);
        console.log(`   Password: (password yang kamu set saat register)`);
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

makeAdmin();
