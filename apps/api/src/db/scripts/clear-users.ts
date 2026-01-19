/**
 * Script untuk menghapus semua user dan data terkait
 * Jalankan: npx tsx src/db/scripts/clear-users.ts
 */

import { db } from '../index.js';
import { user, account, session, verification } from '../schema/auth.js';

async function clearUsers() {
    console.log('🗑️  Menghapus semua user dan data terkait...');
    console.log('');

    try {
        // Delete in order (karena foreign keys)

        // 1. Sessions
        const deletedSessions = await db.delete(session).returning();
        console.log(`✅ Deleted ${deletedSessions.length} sessions`);

        // 2. Accounts (passwords, OAuth links)
        const deletedAccounts = await db.delete(account).returning();
        console.log(`✅ Deleted ${deletedAccounts.length} accounts`);

        // 3. Verifications
        const deletedVerifications = await db.delete(verification).returning();
        console.log(`✅ Deleted ${deletedVerifications.length} verifications`);

        // 4. Users
        const deletedUsers = await db.delete(user).returning();
        console.log(`✅ Deleted ${deletedUsers.length} users`);

        console.log('');
        console.log('🎉 Semua user berhasil dihapus!');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

clearUsers();
