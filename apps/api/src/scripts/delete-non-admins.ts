
import { db } from '../db/index.js';
import { user, session, account, verification } from '../db/schema/auth.js';
import { eq, ne } from 'drizzle-orm';

async function main() {
    console.log('🔍 Searching for non-admin users to delete...');

    // Select all users who are NOT admin
    const nonAdminUsers = await db.select().from(user).where(ne(user.role, 'admin'));

    if (nonAdminUsers.length === 0) {
        console.log('✅ No non-admin users found.');
        process.exit(0);
    }

    console.log(`Found ${nonAdminUsers.length} non-admin users.`);
    const deletedEmails: string[] = [];
    const failedEmails: string[] = [];

    for (const targetUser of nonAdminUsers) {
        process.stdout.write(`Processing user: ${targetUser.email}... `);
        try {
            // Delete related data first - wrapped in transaction ideally, but doing sequentially for script simplicity
            // 1. Sessions
            await db.delete(session).where(eq(session.userId, targetUser.id));
            // 2. Accounts
            await db.delete(account).where(eq(account.userId, targetUser.id));
            // 3. Verifications (based on email)
            await db.delete(verification).where(eq(verification.identifier, targetUser.email));

            // 4. The User
            await db.delete(user).where(eq(user.id, targetUser.id));

            console.log(`✅ Deleted`);
            deletedEmails.push(targetUser.email);
        } catch (error) {
            console.log(`❌ Skipped`);
            // Only log the error message to keep output clean, unless needed
            // console.error(`   Reason: ${(error as any).message}`); 
            failedEmails.push(`${targetUser.email} (${(error as any).message?.split('\n')[0]})`);
        }
    }

    console.log('\n==========================================');
    console.log('Summary of Deletion:');
    console.log('==========================================');

    if (deletedEmails.length > 0) {
        console.log('✅ Successfully Deleted Users:');
        deletedEmails.forEach(email => console.log(` - ${email}`));
    } else {
        console.log('No users were deleted.');
    }

    if (failedEmails.length > 0) {
        console.log('\n⚠️ Skipped Users (Failed to delete):');
        failedEmails.forEach(entry => console.log(` - ${entry}`));
    }

    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Error executing script:', err);
    process.exit(1);
});
