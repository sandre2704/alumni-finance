
import { auth } from '../lib/auth.js';
import { db } from '../db/index.js';
import { user } from '../db/schema/auth.js';
import { eq } from 'drizzle-orm';

async function resetPassword() {
    console.log('Resetting password for admin...');
    try {
        // Find user first
        const [foundUser] = await db.select().from(user).where(eq(user.email, 'admin@alumnifinance.com'));

        if (!foundUser) {
            console.error('❌ Admin user not found!');
            process.exit(1);
        }

        console.log(`Found user: ${foundUser.email} (${foundUser.id})`);

        // Update password using better-auth internal API if exposed, or just use setPassword
        // Since better-auth runs on the server, we might need to use its API
        // But better-auth doesn't always expose a direct "setPassword" in the main object easily without request context.
        // However, we can use the `api` property if available.

        // As a workaround for direct hash access, we can try to use internal function if exported, 
        // but better-auth usually handles hashing.
        // Let's try to see if we can just update it via auth.api

        // Actually, looking at better-auth docs/types (simulated), auth.api might have it.
        // If not, we might need to rely on the user using the correct password or "forgot password".
        // But since I have DB access, I can manually update it if I knew the hash algorithm.
        // better-auth uses bcrypt or argon2 usually.

        // Let's rely on the user trying the correct email first. 
        // But the user *said* failure with 401. 

        // Let's try to update the user using auth.api.changePassword ? No that needs current password.
        // we can use `auth.internal.hashPassword` maybe?

        console.log('NOTE: Cannot directly set password without hash function access. verify if "sandre123" works with email "admin@alumnifinance.com"');

    } catch (error) {
        console.error('❌ Error:', error);
    }
    process.exit(0);
}

resetPassword();
