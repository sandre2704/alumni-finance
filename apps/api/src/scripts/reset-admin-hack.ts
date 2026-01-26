
import { auth } from '../lib/auth.js';
import { db } from '../db/index.js';
import { user } from '../db/schema/auth.js';
import { eq } from 'drizzle-orm';

async function updatePassword() {
    console.log('🔄 Attempting to update password for admin@alumnifinance.com...');

    // 1. Find the user to get ID
    const [foundUser] = await db.select().from(user).where(eq(user.email, 'admin@alumnifinance.com'));

    if (!foundUser) {
        console.error('❌ User not found!');
        process.exit(1);
    }

    console.log(`✅ User found: ${foundUser.id}`);

    // 2. Use better-auth internal API to update password
    // auth.api.setPassword is not directly available on the initialized client usually but let's check internal vs api
    // Better Auth v1 has `auth.api.changePassword` but that requires session (which we don't have)
    // However, if we can import the password hasher, we can update the DB directly.
    // BUT since we can't easily import internal utils, let's try to simulate a password change/reset flow or use `updateUser`.

    // Let's try to use `auth.api.updateUser` ? No, likely checks existing password.

    // ALTERNATIVE: De-activate and Re-activate? No.

    // Correct way: Construct a session-less context? Hard.

    // EASIEST WAY IF YOU HAVE DB ACCESS:
    // Better Auth uses standard hashing.
    // Let's try to just use valid hashing. 
    // BUT we don't have the hashing function exposed.

    // Let's try to use the `auth` instance to `updateUser`.
    // Wait! `better-auth` has an admin API if configured? No.

    // Let's try to use `auth.internal` if accessible (typescript might complain but we are running with tsx)
    // Actually, `better-auth` usually exports `hashPassword`.
    // Let's check if we can import it.

    // If not, we will try to use `auth.api.signUp` to create a NEW user with known password (e.g. `admin2`) 
    // and then copy that hash to the `admin` user manually in DB!
    // This is a clever hack.

    const tempEmail = 'temp_admin_' + Date.now() + '@example.com';
    const knownPassword = 'sandre123';

    console.log(`🛠️ Creating temporary user ${tempEmail} to generate hash...`);

    try {
        // We use the auth.api.signUpEmail (need to check exact method name on server)
        // Server side `auth.api` methods usually expect a request context.
        // This is tricky.

        // Let's try a different approach:
        // Delete the existing 'admin' account credentials from the `account` table 
        // and re-insert them if we could hash it.

        // Wait, if I delete the `account` row for the user, they have no password.
        // Then better-auth might allow "linking"? No.

        // Let's try the "Create Temp User" hack via local Fetch since server is running!
        // We can hit the localhost:3001/api/auth/sign-up/email endpoint!

        const response = await fetch('http://localhost:3001/api/auth/sign-up/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173'
            },
            body: JSON.stringify({
                email: tempEmail,
                password: knownPassword,
                name: 'Temp Admin',
                username: `temp_admin_${Date.now()}` // better-auth might need this if configured
            })
        });

        if (!response.ok) {
            const txt = await response.text();
            console.error('❌ Failed to create temp user:', response.status, txt);
            // Maybe signup is disabled or blocked?
            // If blocked, we can't use this.
            return;
        }

        const data = await response.json();
        console.log('✅ Temp user created!', data.user.id);

        // Now get the account record for this new user
        // We need to query the `account` table (from 'better-auth/migrations' or similar, but we have schema)
        const { account } = await import('../db/schema/auth.js');

        // Find the account for the temp user
        const [tempAccount] = await db.select().from(account).where(eq(account.userId, data.user.id));

        if (!tempAccount || !tempAccount.password) {
            console.error('❌ Could not find password hash for temp user');
            return;
        }

        console.log('🔑 Generated Hash:', tempAccount.password);

        // Now update the REAL admin's account with this hash
        // First find admin's account
        const [adminAccount] = await db.select().from(account).where(eq(account.userId, foundUser.id));

        if (adminAccount) {
            await db.update(account)
                .set({ password: tempAccount.password })
                .where(eq(account.id, adminAccount.id));
            console.log('✅ Updated admin password hash!');
        } else {
            console.log('⚠️ Admin has no account record? Creating one...');
            // Insert new account record
            // We need to generate IDs or match what better-auth expects. 
            // Better-auth usually generates random IDs.
            // But we need to make sure `providerId` is 'credential'
            await db.insert(account).values({
                id: `acc_${Date.now()}`,
                userId: foundUser.id,
                accountId: foundUser.id, // usually same or random
                providerId: 'credential',
                password: tempAccount.password,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('✅ Created admin account record with password!');
        }

        // CLEANUP: Delete temp user
        // await db.delete(user).where(eq(user.id, data.user.id)); // Cascade should handle it if set, or delete account too
        // accounts cascade refernces user usually.
        // But better be safe and leave it or manual delete. 
        // Let's delete it.
        await db.delete(user).where(eq(user.id, data.user.id));
        console.log('🧹 Cleanup done.');

    } catch (err) {
        console.error('❌ Error in hash hack:', err);
    }

    process.exit(0);
}

updatePassword();
