
import { db } from '../db/index.js';
import { user } from '../db/schema/auth.js';
import { eq, or } from 'drizzle-orm';

async function checkUser() {
    console.log('Checking for user "admin"...');
    try {
        const users = await db.select().from(user).where(
            or(
                eq(user.email, 'admin'),
                eq(user.username, 'admin')
            )
        );

        if (users.length === 0) {
            console.log('❌ User "admin" not found in database.');
            const allUsers = await db.select().from(user).limit(5);
            console.log('Recent users:', allUsers.map(u => ({ id: u.id, email: u.email, username: u.username })));
        } else {
            console.log('✅ User found:', JSON.stringify(users[0], null, 2));
        }
    } catch (error) {
        console.error('❌ Error checking user:', error);
    }
    process.exit(0);
}

checkUser();
