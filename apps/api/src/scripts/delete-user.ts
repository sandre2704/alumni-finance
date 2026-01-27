
import { db } from '../db/index.js';
import { user, session, account, verification } from '../db/schema/auth.js';
import { eq } from 'drizzle-orm';

const targetId = 'CZzGHi8a9Cv3u4hL3qpHSey0Ci42Eczc';

async function main() {
    console.log(`🔍 Searching for user with ID: ${targetId}`);

    const users = await db.select().from(user).where(eq(user.id, targetId));

    if (users.length === 0) {
        console.log('⚠️ No user found with this ID.');
        return;
    }

    const targetUser = users[0];
    console.log(`✅ User found: ${targetUser.name} (${targetUser.email})`);

    console.log('🗑️ Deleting related sessions...');
    await db.delete(session).where(eq(session.userId, targetId));

    console.log('🗑️ Deleting related accounts...');
    await db.delete(account).where(eq(account.userId, targetId));

    console.log('🗑️ Deleting related verifications...');
    await db.delete(verification).where(eq(verification.identifier, targetUser.email));

    console.log('🗑️ Deleting user...');
    await db.delete(user).where(eq(user.id, targetId));

    console.log('✅ User and related data deleted successfully.');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Error executing script:', err);
    process.exit(1);
});
