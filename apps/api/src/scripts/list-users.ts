
import { db } from '../db/index.js';
import { user } from '../db/schema/auth.js';

async function main() {
    console.log('🔍 Listing all current users...');

    const users = await db.select().from(user);

    if (users.length === 0) {
        console.log('⚠️ No users found in database.');
        return;
    }

    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
        console.log(`- Role: [${u.role}] | Name: ${u.name} | Email: ${u.email} | ID: ${u.id}`);
    });

    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Error executing script:', err);
    process.exit(1);
});
