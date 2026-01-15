import { db } from '../db/index';
import { sql } from 'drizzle-orm';

async function addProfileCompletedColumn() {
    try {
        console.log('Adding profile_completed column to user table...');

        // Check if column exists first
        const checkResult = await db.execute(sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'user' AND column_name = 'profile_completed'
        `);

        if (checkResult.rows.length > 0) {
            console.log('Column profile_completed already exists');
            return;
        }

        // Add the column
        await db.execute(sql`
            ALTER TABLE "user" 
            ADD COLUMN IF NOT EXISTS "profile_completed" boolean DEFAULT false
        `);

        console.log('Successfully added profile_completed column');
        process.exit(0);
    } catch (error) {
        console.error('Error adding column:', error);
        process.exit(1);
    }
}

addProfileCompletedColumn();
