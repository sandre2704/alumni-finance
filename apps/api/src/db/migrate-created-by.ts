import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function migrateCreatedByColumn() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    console.log('Starting migration: Altering created_by column from uuid to text...');

    try {
        // Drop the foreign key constraint first
        console.log('Step 1: Dropping FK constraint...');
        await pool.query(`
            ALTER TABLE transactions 
            DROP CONSTRAINT IF EXISTS transactions_created_by_user_id_fk
        `);

        // Alter the column type from uuid to text
        console.log('Step 2: Altering column type...');
        await pool.query(`
            ALTER TABLE transactions 
            ALTER COLUMN created_by TYPE text USING created_by::text
        `);

        // Re-add the foreign key constraint
        console.log('Step 3: Re-adding FK constraint...');
        await pool.query(`
            ALTER TABLE transactions 
            ADD CONSTRAINT transactions_created_by_user_id_fk 
            FOREIGN KEY (created_by) REFERENCES "user"(id)
        `);

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
    }

    process.exit(0);
}

migrateCreatedByColumn();
